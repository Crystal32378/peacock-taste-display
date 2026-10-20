"""Record the peacock's English lines locally with Kokoro (open-source TTS, British voice `bm_fable`).
No API key, no network calls beyond the one-time model download.

  pip install kokoro-onnx soundfile        # and ffmpeg on PATH
  # models (one-time):  https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
  #   kokoro-v1.0.int8.onnx  voices-v1.0.bin   -> put them next to this script or pass KOKORO_DIR
  node -e "import('./scripts/voice-lines.mjs').then(m=>console.log(JSON.stringify(m.enumerateLines(['en']))))" > /tmp/lines.json
  python3 scripts/make-voice-kokoro.py /tmp/lines.json

Writes public/audio/en/<id>.mp3 (skips files that exist; --force to redo).
"""
import json, os, subprocess, sys, tempfile
import soundfile as sf
from kokoro_onnx import Kokoro

here = os.path.dirname(os.path.abspath(__file__))
mdir = os.environ.get('KOKORO_DIR', here)
VOICE = os.environ.get('KOKORO_VOICE', 'bm_fable')
out_dir = os.path.join(here, '..', 'public', 'audio', os.environ.get('KOKORO_OUT', 'en'))
SCALE = float(os.environ.get('KOKORO_SPEED_SCALE', '1'))
os.makedirs(out_dir, exist_ok=True)
force = '--force' in sys.argv
lines = json.load(open(sys.argv[1]))
k = Kokoro(os.path.join(mdir, 'kokoro-v1.0.int8.onnx'), os.path.join(mdir, 'voices-v1.0.bin'))

# a dry, unhurried delivery for put-downs; a little quicker when flustered
def speed_for(line_id):
    key = line_id.split('.')[2]
    return {'fold': 0.86, 'yawn': 0.8, 'eyeroll': 0.84, 'flicker': 0.9, 'startle': 0.98, 'swoon': 0.98, 'shiver': 0.94}.get(key, 0.92)

done = 0
for l in lines:
    path = os.path.join(out_dir, l['id'] + '.mp3')
    if os.path.exists(path) and not force:
        continue
    text = l['text'].replace('…', '... ').replace('  ', ' ')
    samples, sr = k.create(text, voice=VOICE, speed=speed_for(l['id']) * SCALE, lang='en-gb')
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        sf.write(tmp.name, samples, sr)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp.name,
                        '-af', 'silenceremove=stop_periods=-1:stop_duration=0.6:stop_threshold=-45dB,loudnorm=I=-18:TP=-2',
                        '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', path], check=True)
    done += 1
    print(f"{done:2d} {l['id']}")
print('recorded', done)
