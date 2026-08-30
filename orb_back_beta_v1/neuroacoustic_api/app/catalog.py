import os
import yaml
from typing import Dict, List, Any
from app.config import config

class PresetCatalog:
    def __init__(self):
        self.presets = {}
        self._load_presets()
    
    def _load_presets(self):
        if not os.path.exists(config.PRESETS_DIR):
            return
        
        for filename in os.listdir(config.PRESETS_DIR):
            if filename.endswith((".yaml", ".yml")):
                try:
                    with open(os.path.join(config.PRESETS_DIR, filename), 'r', encoding='utf-8') as f:
                        preset_data = yaml.safe_load(f)
                        title = preset_data.get("title", filename.replace(".yaml", "").replace("_", " ").title())
                        self.presets[filename] = {
                            "id": filename,
                            "title": title,
                            "config": preset_data,
                            "steps": preset_data.get("steps", []),
                            "background_noise": preset_data.get("background_noise"),
                            "duration": self._calculate_duration(preset_data),
                        }
                except Exception as e:
                    print(f"Erro ao carregar preset {filename}: {e}")
    
    def _calculate_duration(self, preset_data: Dict) -> int:
        total = 0
        for step in preset_data.get("steps", []):
            total += step.get("duration", 0)
        return total
    
    def list_presets(self) -> List[Dict]:
        return [
            {
                "id": preset_id,
                "title": data["title"],
                "duration": data["duration"],
                "has_noise": data["background_noise"] is not None,
                "steps_count": len(data["steps"]),
            }
            for preset_id, data in self.presets.items()
        ]
    
    def get_preset(self, preset_id: str) -> Dict:
        return self.presets.get(preset_id)
