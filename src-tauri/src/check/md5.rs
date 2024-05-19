use std::fs::File;
use std::io::Read;
use async_channel::Sender;
use md5::{Digest, Md5};
use tauri::{AppHandle, Manager};

pub trait MD5Checker {
    async fn check_md5(&mut self, app_handle: AppHandle, name: &str, event: &str) -> String;
}

impl MD5Checker for File {
    async fn check_md5(&mut self, app_handle: AppHandle, name: &str, event: &str) -> String {
        println!("Start checking md5 for {}", name);
        let mut buffer = [0; 4096];
        let mut count = 0;
        let mut hasher = Md5::new();
        let event_name = "progress-".to_string() + event;
        println!("Emitting event {}", event_name);

        while let Ok(n) = self.read(&mut buffer[..]) {
            if n != 4096 {
                // half of it is used
                let rest = &buffer[0..n];
                hasher.update(&rest);
                app_handle.emit_all(&event_name, count + n).unwrap();
                app_handle.emit_all(&event_name, 0).unwrap();
                // println!("b {}", n);
                break;
            } else {
                // all is used
                hasher.update(&buffer);
                count += n;
                if count % (1024 * 10240) == 0 {
                    app_handle.emit_all(&event_name, count).unwrap()
                }
                // println!("a {}", n);
            }
        }
        let hash = hasher.finalize();
        println!("Finish checking md5 for {}", name);
        return hash.iter().map(|e| format!("{:02X}", e)).collect::<String>();
    }
}
