mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::open_file,
            commands::save_file,
            commands::list_dir,
            commands::create_file,
            commands::rename_file,
            commands::delete_file,
            commands::save_image,
            commands::search_files,
            commands::export_html,
            commands::export_pdf,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
