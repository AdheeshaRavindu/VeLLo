#!/usr/bin/env python
import sys
import mediapipe.tasks

print("All imported mediapipe modules:")
for key in sorted(sys.modules.keys()):
    if 'mediapipe' in key:
        print(f"  {key}")
