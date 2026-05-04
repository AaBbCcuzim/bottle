mod commands;
mod search;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::open_file,
            commands::save_file,
            commands::list_dir,
            commands::create_file,
            commands::rename_file,
            commands::delete_file,
            commands::save_image,
            commands::search_files,
            commands::index_file,
            commands::export_html,
            commands::export_pdf,
            commands::get_platform,
        ])
        .setup(|app| {
            #[cfg(target_os = "windows")]
            app.get_webview_window("main").expect("main window").set_decorations(false)?;
            #[cfg(not(target_os = "windows"))]
            let _ = app;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
