use tauri::command;
use std::process::Command;
use std::net::UdpSocket;

#[command]
fn get_network_info() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("ipconfig")
            .output()
            .map_err(|e| e.to_string())?;
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
    
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("ifconfig")
            .output()
            .map_err(|e| e.to_string())?;
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
    
    #[cfg(target_os = "linux")]
    {
        let output = Command::new("ip")
            .arg("addr")
            .output()
            .map_err(|e| e.to_string())?;
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![get_network_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}