use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;
use tauri::command;
use tauri::Manager;
use crate::search::{SearchManager, SearchResult};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Vec<FileEntry>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub file_extensions: Vec<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            file_extensions: vec!["md".to_string()],
        }
    }
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
pub fn list_dir(path: String, extensions: Vec<String>) -> Result<FileEntry, String> {
    let root = PathBuf::from(&path);
    let name = root
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.clone());

    let children = list_dir_recursive(&root, &extensions)?;

    Ok(FileEntry {
        name,
        path,
        is_dir: true,
        children,
    })
}

fn list_dir_recursive(dir: &PathBuf, extensions: &[String]) -> Result<Vec<FileEntry>, String> {
    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    let mut result = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files/directories
        if name.starts_with('.') {
            continue;
        }

        let entry_path = entry.path();

        if entry_path.is_dir() {
            let children = list_dir_recursive(&entry_path, extensions)?;
            // Only include non-empty directories (that have matching files)
            if !children.is_empty() {
                result.push(FileEntry {
                    name,
                    path: entry_path.to_string_lossy().to_string(),
                    is_dir: true,
                    children,
                });
            }
        } else if let Some(ext) = entry_path.extension() {
            let ext_str = ext.to_string_lossy().to_lowercase();
            if extensions.is_empty() || extensions.contains(&ext_str) {
                result.push(FileEntry {
                    name,
                    path: entry_path.to_string_lossy().to_string(),
                    is_dir: false,
                    children: Vec::new(),
                });
            }
        }
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
pub fn get_platform() -> String {
    #[cfg(target_os = "macos")]
    { "macos".to_string() }
    #[cfg(target_os = "windows")]
    { "windows".to_string() }
    #[cfg(target_os = "linux")]
    { "linux".to_string() }
    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    { "unknown".to_string() }
}

#[command]
pub fn index_file(dir: String, file_path: String, content: String) -> Result<(), String> {
    get_search().get_or_create(&dir)?;
    get_search().index_file(&dir, &file_path, &content)
}

#[command]
pub fn get_config(app: tauri::AppHandle) -> Result<AppConfig, String> {
    let config_path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("config.json");

    if !config_path.exists() {
        return Ok(AppConfig::default());
    }

    let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[command]
pub fn set_config(app: tauri::AppHandle, config: AppConfig) -> Result<(), String> {
    let config_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    let config_path = config_dir.join("config.json");
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&config_path, &content).map_err(|e| e.to_string())
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
        let sub = dir.path().join("sub");
        fs::create_dir(&sub).unwrap();
        fs::write(sub.join("b.md"), "").unwrap();

        let result = list_dir(
            dir.path().to_string_lossy().to_string(),
            vec!["md".to_string()],
        )
        .unwrap();

        assert!(result.is_dir);
        assert_eq!(result.children.len(), 2); // sub dir + a.md
        // First should be dir (sorted: dirs first)
        assert!(result.children[0].is_dir);
        assert_eq!(result.children[0].children.len(), 1);
        assert!(!result.children[1].is_dir);
    }

    #[test]
    fn test_list_dir_filters_extensions() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("a.md"), "").unwrap();
        fs::write(dir.path().join("b.txt"), "").unwrap();
        fs::write(dir.path().join("c.png"), "").unwrap();

        let result = list_dir(
            dir.path().to_string_lossy().to_string(),
            vec!["md".to_string()],
        )
        .unwrap();

        assert_eq!(result.children.len(), 1);
        assert_eq!(result.children[0].name, "a.md");
    }

    #[test]
    fn test_list_dir_empty_extensions_shows_all() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("a.md"), "").unwrap();
        fs::write(dir.path().join("b.txt"), "").unwrap();

        let result = list_dir(
            dir.path().to_string_lossy().to_string(),
            Vec::<String>::new(),
        )
        .unwrap();

        assert_eq!(result.children.len(), 2);
    }

    #[test]
    fn test_list_dir_skips_hidden() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join(".hidden.md"), "").unwrap();
        fs::write(dir.path().join("visible.md"), "").unwrap();
        fs::create_dir(dir.path().join(".git")).unwrap();

        let result = list_dir(
            dir.path().to_string_lossy().to_string(),
            vec!["md".to_string()],
        )
        .unwrap();

        assert_eq!(result.children.len(), 1);
        assert_eq!(result.children[0].name, "visible.md");
    }

    #[test]
    fn test_create_file() {
        let dir = TempDir::new().unwrap();
        let path = create_file(
            dir.path().to_string_lossy().to_string(),
            "new.md".to_string(),
        )
        .unwrap();
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
        )
        .unwrap();
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
        )
        .unwrap();
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
        )
        .unwrap();
        let content = fs::read_to_string(&dest).unwrap();
        assert!(content.contains("<h1>Hello</h1>"));
    }
}
