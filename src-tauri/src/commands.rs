use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;
use tauri::command;
use crate::search::{SearchManager, SearchResult};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

static SEARCH_MANAGER: OnceLock<SearchManager> = OnceLock::new();
fn get_search() -> &'static SearchManager {
    SEARCH_MANAGER.get_or_init(SearchManager::new)
}

#[command]
pub fn open_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[command]
pub fn save_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| e.to_string())
}

#[command]
pub fn list_dir(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        let entry_path = entry.path();
        let is_dir = entry_path.is_dir();
        result.push(FileEntry {
            name,
            path: entry_path.to_string_lossy().to_string(),
            is_dir,
        });
    }
    result.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            b.is_dir.cmp(&a.is_dir)
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });
    Ok(result)
}

#[command]
pub fn create_file(parent_dir: String, name: String) -> Result<String, String> {
    let path = PathBuf::from(&parent_dir).join(&name);
    fs::write(&path, "").map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[command]
pub fn rename_file(old_path: String, new_name: String) -> Result<String, String> {
    let old = PathBuf::from(&old_path);
    let new = old.parent().unwrap_or(&old).join(&new_name);
    fs::rename(&old, &new).map_err(|e| e.to_string())?;
    Ok(new.to_string_lossy().to_string())
}

#[command]
pub fn delete_file(path: String) -> Result<(), String> {
    trash::delete(&path).map_err(|e| e.to_string())
}

#[command]
pub fn save_image(data: Vec<u8>, filename: String, workspace_dir: String) -> Result<String, String> {
    let images_dir = PathBuf::from(&workspace_dir).join("images");
    fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;
    let filepath = images_dir.join(&filename);
    fs::write(&filepath, &data).map_err(|e| e.to_string())?;
    Ok(format!("./images/{}", filename))
}

#[command]
pub fn export_html(markdown: String, dest_path: String) -> Result<(), String> {
    let mut html = String::from("<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n");
    html.push_str("<title>Export</title>\n</head>\n<body>\n");
    html.push_str(&markdown_to_html(&markdown));
    html.push_str("\n</body>\n</html>");
    fs::write(&dest_path, &html).map_err(|e| e.to_string())
}

#[command]
pub fn export_pdf(_markdown: String, _dest_path: String) -> Result<(), String> {
    Err("PDF export not yet implemented".to_string())
}

fn markdown_to_html(md: &str) -> String {
    use comrak::{markdown_to_html_with_plugins, ComrakOptions, ComrakPlugins};
    let options = ComrakOptions::default();
    let plugins = ComrakPlugins::default();
    markdown_to_html_with_plugins(md, &options, &plugins)
}

#[command]
pub fn search_files(dir: String, query: String) -> Result<Vec<SearchResult>, String> {
    get_search().search(&dir, &query)
}

#[command]
pub fn index_file(dir: String, file_path: String, content: String) -> Result<(), String> {
    get_search().get_or_create(&dir)?;
    get_search().index_file(&dir, &file_path, &content)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_open_file() {
        let dir = TempDir::new().unwrap();
        let file_path = dir.path().join("test.md");
        fs::write(&file_path, "# Hello").unwrap();
        let result = open_file(file_path.to_string_lossy().to_string()).unwrap();
        assert_eq!(result, "# Hello");
    }

    #[test]
    fn test_save_file() {
        let dir = TempDir::new().unwrap();
        let file_path = dir.path().join("test.md");
        let path_str = file_path.to_string_lossy().to_string();
        save_file(path_str.clone(), "# Hello".to_string()).unwrap();
        assert_eq!(fs::read_to_string(&path_str).unwrap(), "# Hello");
    }

    #[test]
    fn test_list_dir() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("a.md"), "").unwrap();
        fs::create_dir(dir.path().join("sub")).unwrap();
        let result = list_dir(dir.path().to_string_lossy().to_string()).unwrap();
        assert_eq!(result.len(), 2);
        assert!(result[0].is_dir);
        assert!(!result[1].is_dir);
    }

    #[test]
    fn test_create_file() {
        let dir = TempDir::new().unwrap();
        let path = create_file(
            dir.path().to_string_lossy().to_string(),
            "new.md".to_string(),
        ).unwrap();
        assert!(PathBuf::from(&path).exists());
    }

    #[test]
    fn test_rename_file() {
        let dir = TempDir::new().unwrap();
        let file = dir.path().join("old.md");
        fs::write(&file, "test").unwrap();
        let new_path = rename_file(
            file.to_string_lossy().to_string(),
            "new.md".to_string(),
        ).unwrap();
        assert!(new_path.ends_with("new.md"));
        assert!(!file.exists());
    }

    #[test]
    fn test_save_image() {
        let dir = TempDir::new().unwrap();
        let result = save_image(
            vec![1, 2, 3],
            "test.png".to_string(),
            dir.path().to_string_lossy().to_string(),
        ).unwrap();
        assert_eq!(result, "./images/test.png");
        let saved_path = dir.path().join("images").join("test.png");
        assert!(saved_path.exists());
    }

    #[test]
    fn test_export_html() {
        let dir = TempDir::new().unwrap();
        let dest = dir.path().join("out.html");
        export_html(
            "# Hello".to_string(),
            dest.to_string_lossy().to_string(),
        ).unwrap();
        let content = fs::read_to_string(&dest).unwrap();
        assert!(content.contains("<h1>Hello</h1>"));
    }
}
