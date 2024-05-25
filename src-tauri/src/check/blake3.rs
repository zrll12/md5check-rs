use std::fs::File;
use std::io::Read;
use md5::{Digest, Md5};
use tauri::{AppHandle, Manager};
use crate::check::THREAD_CACHE;

pub trait Blake3Checker {
    async fn check_blake3(&mut self, app_handle: AppHandle, name: String, event: String) -> String;
}

impl Blake3Checker for File {
    async fn check_blake3(&mut self, app_handle: AppHandle, name: String, event: String) -> String {
        if !THREAD_CACHE.contains_key(&event) {
            //already removed
            return "".to_string();
        }
        
        println!("Start checking blake3 for {name}, id {event}");
        let mut buffer = [0; 4096];
        let mut count = 0;
        let mut hasher = blake3::Hasher::new();
        let progress_event_name = "progress-".to_string() + &event;
        let finish_event_name = "finish-".to_string() + &event;

        while let Ok(n) = self.read(&mut buffer[..]) {
            if n != 4096 {
                // half of it is used
                let rest = &buffer[0..n];
                hasher.update(&rest);
                app_handle.emit_all(&progress_event_name, count + n).unwrap();
                app_handle.emit_all(&progress_event_name, 0).unwrap();
                // println!("b {}", n);
                break;
            } else {
                // all is used
                hasher.update(&buffer);
                count += n;
                if count % (1024 * 1024 * 100) == 0 {
                    app_handle.emit_all(&progress_event_name, count).unwrap()
                }
                if count % (1024 * 1024 * 100) == 0 {
                    if !THREAD_CACHE.contains_key(&event) {
                        println!("Stop checking md5 for {}", name);
                        return "".to_string();
                    }
                }
                // println!("a {}", n);
            }
        }
        let hash = hasher.finalize().to_string();
        app_handle.emit_all(&finish_event_name, &hash).unwrap();
        println!("Finish checking blake3 for {name} ({hash})");
        THREAD_CACHE.remove(&event);
        return hash;
    }
}
