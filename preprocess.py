from utils import build_dataset_from_sources

build_dataset_from_sources([
    ("training/AD", 1),
    ("training/CN", 0),
], "datasets/dataset.pt")