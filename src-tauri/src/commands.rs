use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
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
pub fn save_image(_path: String, _data: String) -> Result<String, String> {
    Err("not implemented yet".to_string())
}

#[command]
pub fn search_files(_query: String) -> Result<Vec<String>, String> {
    Err("not implemented yet".to_string())
}

#[command]
pub fn export_html(_path: String) -> Result<String, String> {
    Err("not implemented yet".to_string())
}

#[command]
pub fn export_pdf(_path: String) -> Result<String, String> {
    Err("not implemented yet".to_string())
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
}
