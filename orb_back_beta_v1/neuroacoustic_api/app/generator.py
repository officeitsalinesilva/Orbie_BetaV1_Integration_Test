import io
import numpy as np
import soundfile as sf
from pydub import AudioSegment
from typing import Literal, Optional
from app.config import config
from app.catalog import PresetCatalog

class NeuroacousticGenerator:
    """Gerador de áudio neuroacústico."""
    
    def __init__(self):
        self.sample_rate = config.SAMPLE_RATE
        self.catalog = PresetCatalog()
    
    # ===== TONS PUROS =====
    def generate_tone(self, frequency: int, duration: int = 60, 
                      volume: float = 0.5, waveform: Literal["sine", "square", "sawtooth", "triangle"] = "sine",
                      format: Literal["wav", "mp3"] = "wav") -> bytes:
        """Gera um tom puro com a forma de onda especificada."""
        t = np.linspace(0, duration, int(self.sample_rate * duration), endpoint=False)
        
        if waveform == "sine":
            audio = volume * np.sin(2 * np.pi * frequency * t)
        elif waveform == "square":
            audio = volume * np.sign(np.sin(2 * np.pi * frequency * t))
        elif waveform == "sawtooth":
            audio = volume * (2 * (t * frequency % 1) - 1)
        elif waveform == "triangle":
            audio = volume * (2 * np.abs(2 * (t * frequency % 1) - 1) - 1)
        else:
            raise ValueError(f"Forma de onda '{waveform}' não suportada.")
        
        audio_stereo = np.column_stack((audio, audio))
        return self._save_audio(audio_stereo, format)
    
    # ===== BINAURAL =====
    def generate_binaural(self, left_freq: int, right_freq: int, 
                          duration: int = 60, volume: float = 0.5,
                          waveform: Literal["sine", "square", "sawtooth", "triangle"] = "sine",
                          format: Literal["wav", "mp3"] = "wav") -> bytes:
        """Gera uma batida binaural com canais L e R diferentes."""
        t = np.linspace(0, duration, int(self.sample_rate * duration), endpoint=False)
        
        if waveform == "sine":
            left = volume * np.sin(2 * np.pi * left_freq * t)
            right = volume * np.sin(2 * np.pi * right_freq * t)
        elif waveform == "square":
            left = volume * np.sign(np.sin(2 * np.pi * left_freq * t))
            right = volume * np.sign(np.sin(2 * np.pi * right_freq * t))
        elif waveform == "sawtooth":
            left = volume * (2 * (t * left_freq % 1) - 1)
            right = volume * (2 * (t * right_freq % 1) - 1)
        elif waveform == "triangle":
            left = volume * (2 * np.abs(2 * (t * left_freq % 1) - 1) - 1)
            right = volume * (2 * np.abs(2 * (t * right_freq % 1) - 1) - 1)
        else:
            raise ValueError(f"Forma de onda '{waveform}' não suportada.")
        
        audio_stereo = np.column_stack((left, right))
        return self._save_audio(audio_stereo, format)
    
    # ===== RUÍDOS =====
    def generate_noise(self, noise_type: Literal["white", "pink", "brown", "blue", "violet", "grey", "rain", "ocean"],
                       duration: int = 60, volume: float = 0.3,
                       format: Literal["wav", "mp3"] = "wav") -> bytes:
        """Gera ruído do tipo especificado."""
        # Implementação simples de ruído usando numpy
        audio = np.random.normal(0, volume, int(self.sample_rate * duration))
        
        # Aplica filtro para diferentes tipos de ruído
        if noise_type == "white":
            pass  # Já é branco
        elif noise_type == "pink":
            # Filtro simples para ruído rosa (aproximação)
            from scipy import signal
            b, a = signal.butter(1, 0.5, btype='low')
            audio = signal.filtfilt(b, a, audio)
        elif noise_type == "brown":
            # Ruído marrom (integração do ruído branco)
            audio = np.cumsum(audio) / np.sqrt(len(audio))
        else:
            # Para blue, violet, grey, rain, ocean - usamos white como fallback
            pass
        
        audio = audio / np.max(np.abs(audio)) * volume
        audio_stereo = np.column_stack((audio, audio))
        return self._save_audio(audio_stereo, format)
    
    # ===== PRESETS =====
    def generate_preset(self, preset_id: str, duration: Optional[int] = None,
                        format: Literal["wav", "mp3"] = "wav") -> bytes:
        """Gera áudio a partir de um preset do catálogo."""
        preset_data = self.catalog.get_preset(preset_id)
        if not preset_data:
            raise ValueError(f"Preset '{preset_id}' não encontrado.")
        
        # Gera um tom baseado no preset (simplificado)
        steps = preset_data.get("steps", [])
        if not steps:
            raise ValueError(f"Preset '{preset_id}' não tem steps definidos.")
        
        # Pega o primeiro step como referência
        first_step = steps[0]
        freq = first_step.get("frequency", 100)
        duration = duration or first_step.get("duration", 60)
        
        return self.generate_tone(frequency=freq, duration=duration, format=format)
    
    # ===== SALVAMENTO (WAV / MP3) =====
    def _save_audio(self, audio_data: np.ndarray, format: Literal["wav", "mp3"] = "wav") -> bytes:
        """Salva o áudio em um buffer de memória no formato especificado."""
        buffer = io.BytesIO()
        
        if format == "wav":
            sf.write(buffer, audio_data, self.sample_rate, format='WAV')
        elif format == "mp3":
            wav_buffer = io.BytesIO()
            sf.write(wav_buffer, audio_data, self.sample_rate, format='WAV')
            wav_buffer.seek(0)
            
            audio_segment = AudioSegment.from_wav(wav_buffer)
            audio_segment.export(buffer, format="mp3", bitrate="192k")
        else:
            raise ValueError(f"Formato '{format}' não suportado.")
        
        buffer.seek(0)
        return buffer.getvalue()