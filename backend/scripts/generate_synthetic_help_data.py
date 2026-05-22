"""Generate synthetic landmark CSV for 'help' and 'not_help' classes to bootstrap training.

This creates `backend/data/help_samples.csv` with configurable sample counts.
"""
import csv
import os
import random
from datetime import datetime

OUT_CSV = os.path.join(os.path.dirname(__file__), '..', 'data', 'help_samples.csv')

def header_cols():
    cols = ['label'] + [f'p{i}_{c}' for i in range(21) for c in ('x','y','z')] + [f's{i}_{c}' for i in range(21) for c in ('x','y','z')] + ['timestamp']
    return cols

def base_hand(wrist_x, wrist_y, scale=0.05, handedness='Right'):
    # Simple synthetic 21 points arranged roughly like a hand
    pts = []
    # wrist
    pts.append((wrist_x, wrist_y, 0.0))
    # thumb (4 points: mcp/ip/tip approximated)
    for i in range(1,5):
        dx = (-1 if handedness=='Right' else 1) * (0.02 + 0.01*i)
        pts.append((wrist_x + dx*scale, wrist_y - 0.02*i*scale, 0.0))
    # index
    for i in range(1,5):
        pts.append((wrist_x + 0.02*scale, wrist_y - 0.03*i*scale, 0.0))
    # middle
    for i in range(1,5):
        pts.append((wrist_x + 0.0, wrist_y - 0.03*i*scale, 0.0))
    # ring
    for i in range(1,5):
        pts.append((wrist_x - 0.02*scale, wrist_y - 0.025*i*scale, 0.0))
    # pinky
    for i in range(1,5):
        pts.append((wrist_x - 0.035*scale, wrist_y - 0.02*i*scale, 0.0))
    # ensure length 21
    if len(pts) < 21:
        pts += [(wrist_x, wrist_y, 0.0)] * (21 - len(pts))
    return pts[:21]

def make_help_sample():
    # primary: thumb up fist-ish
    primary = base_hand(0.5, 0.4, scale=1.0, handedness=random.choice(['Right','Left']))
    # modify to simulate thumb-up: move thumb tip away and fold other fingers
    # thumb tip is index 4 in our synthetic ordering
    px = list(primary)
    # fold fingers closer to wrist
    for idx in [8,12,16,20]:
        x,y,z = px[idx]
        px[idx] = (x, y + 0.02, z)
    # thumb tip outward
    tx,ty,tz = px[4]
    px[4] = (tx + ( -0.03 if px[1][0] < px[0][0] else 0.03 ), ty - 0.04, tz)

    # secondary support open palm below primary
    secondary = base_hand(0.5, 0.55, scale=1.1, handedness='Left')
    sx = list(secondary)
    # splay fingers out for open palm
    for i in range(5,21):
        x,y,z = sx[i]
        sx[i] = (x + (i%3-1)*0.01, y, z)

    return px, sx

def make_not_help_sample():
    # random hands
    primary = base_hand(random.uniform(0.3,0.7), random.uniform(0.3,0.6), scale=random.uniform(0.6,1.2), handedness=random.choice(['Right','Left']))
    secondary = base_hand(random.uniform(0.2,0.8), random.uniform(0.3,0.8), scale=random.uniform(0.6,1.2), handedness=random.choice(['Right','Left']))
    # jitter
    def jitter(hand):
        return [(x+random.uniform(-0.02,0.02), y+random.uniform(-0.02,0.02), z+random.uniform(-0.01,0.01)) for (x,y,z) in hand]
    return jitter(primary), jitter(secondary)

def ensure_dir(path):
    d = os.path.dirname(path)
    if not os.path.exists(d):
        os.makedirs(d, exist_ok=True)

def generate(n_per_class=300):
    ensure_dir(OUT_CSV)
    with open(OUT_CSV, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header_cols())
        for _ in range(n_per_class):
            p,s = make_help_sample()
            row = ['help'] + [coord for pt in p for coord in pt] + [coord for pt in s for coord in pt] + [datetime.utcnow().isoformat()]
            writer.writerow(row)
        for _ in range(n_per_class):
            p,s = make_not_help_sample()
            row = ['not_help'] + [coord for pt in p for coord in pt] + [coord for pt in s for coord in pt] + [datetime.utcnow().isoformat()]
            writer.writerow(row)
    print('Wrote', OUT_CSV)

if __name__ == '__main__':
    generate(n_per_class=250)
