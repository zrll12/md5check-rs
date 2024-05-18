// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod check;
mod file;

fn main() {
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![check::sum_md5, file::get_md5_list, file::get_file_size, file::get_new_file])
      .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
