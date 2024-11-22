// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    the_north_star_lib::run();

    log::info!("Tauri is awesome!");
}
