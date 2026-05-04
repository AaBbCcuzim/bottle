use serde::Serialize;
use std::collections::HashMap;
use std::path::Path;
use std::sync::Mutex;
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::schema::{Schema, Value, STORED, TEXT};
use tantivy::{doc, Index, IndexReader, IndexWriter, ReloadPolicy};

#[derive(Debug, Serialize, Clone)]
pub struct SearchResult {
    pub file_path: String,
    pub snippet: String,
    pub line_number: u32,
}

pub struct SearchState {
    _writer: Mutex<IndexWriter>,
    reader: IndexReader,
    index: Index,
}

impl SearchState {
    pub fn open_or_create(dir: &Path) -> Result<Self, String> {
        let index_path = dir.join(".mdsearch_index");
        let mut schema_builder = Schema::builder();
        let _body = schema_builder.add_text_field("body", TEXT);
        let _path_field = schema_builder.add_text_field("path", STORED);
        let schema = schema_builder.build();

        let index = if index_path.exists() {
            Index::open_in_dir(&index_path).map_err(|e| e.to_string())?
        } else {
            std::fs::create_dir_all(&index_path).map_err(|e| e.to_string())?;
            Index::create_in_dir(&index_path, schema.clone()).map_err(|e| e.to_string())?
        };

        let writer = index.writer(50_000_000).map_err(|e| e.to_string())?;
        let reader = index
            .reader_builder()
            .reload_policy(ReloadPolicy::OnCommitWithDelay)
            .try_into()
            .map_err(|e| e.to_string())?;

        Ok(SearchState {
            index,
            reader,
            _writer: Mutex::new(writer),
        })
    }

    pub fn index_file(&self, file_path: &str, content: &str) -> Result<(), String> {
        let schema = self.index.schema();
        let body_field = schema.get_field("body").unwrap();
        let path_field = schema.get_field("path").unwrap();

        let mut writer = self._writer.lock().map_err(|e| e.to_string())?;
        writer.delete_term(tantivy::Term::from_field_text(path_field, file_path));
        writer.commit().map_err(|e| e.to_string())?;

        writer
            .add_document(doc!(body_field => content, path_field => file_path))
            .map_err(|e| e.to_string())?;
        writer.commit().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn search(&self, query_str: &str) -> Result<Vec<SearchResult>, String> {
        let schema = self.index.schema();
        let body_field = schema.get_field("body").unwrap();
        let path_field = schema.get_field("path").unwrap();

        let searcher = self.reader.searcher();
        let query_parser = QueryParser::for_index(&self.index, vec![body_field]);
        let query = query_parser.parse_query(query_str).map_err(|e| e.to_string())?;
        let top_docs = searcher
            .search(&query, &TopDocs::with_limit(20))
            .map_err(|e| e.to_string())?;

        let mut results = Vec::new();
        for (_score, doc_address) in top_docs {
            let doc = searcher
                .doc::<tantivy::TantivyDocument>(doc_address)
                .map_err(|e| e.to_string())?;
            let file_path = doc
                .get_first(path_field)
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let body = doc
                .get_first(body_field)
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let snippet = body
                .to_lowercase()
                .find(&query_str.to_lowercase())
                .map(|pos| {
                    let start = pos.saturating_sub(40);
                    let end = (pos + query_str.len() + 40).min(body.len());
                    format!(
                        "{}...{}",
                        if start > 0 { "..." } else { "" },
                        &body[start..end]
                    )
                })
                .unwrap_or_else(|| body.chars().take(80).collect());
            results.push(SearchResult {
                file_path,
                snippet,
                line_number: 1,
            });
        }
        Ok(results)
    }
}

pub struct SearchManager {
    states: Mutex<HashMap<String, SearchState>>,
}

impl SearchManager {
    pub fn new() -> Self {
        SearchManager {
            states: Mutex::new(HashMap::new()),
        }
    }

    pub fn get_or_create(&self, dir: &str) -> Result<(), String> {
        let mut states = self.states.lock().map_err(|e| e.to_string())?;
        if !states.contains_key(dir) {
            let state = SearchState::open_or_create(Path::new(dir))?;
            states.insert(dir.to_string(), state);
        }
        Ok(())
    }

    pub fn index_file(&self, dir: &str, file_path: &str, content: &str) -> Result<(), String> {
        let states = self.states.lock().map_err(|e| e.to_string())?;
        if let Some(state) = states.get(dir) {
            state.index_file(file_path, content)?;
        }
        Ok(())
    }

    pub fn search(&self, dir: &str, query: &str) -> Result<Vec<SearchResult>, String> {
        let states = self.states.lock().map_err(|e| e.to_string())?;
        if let Some(state) = states.get(dir) {
            state.search(query)
        } else {
            Ok(Vec::new())
        }
    }
}
