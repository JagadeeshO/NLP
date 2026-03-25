import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from sklearn.datasets import fetch_lfw_pairs
import numpy as np
from PIL import Image

class LFWPairsDataset(Dataset):
    """
    Loads Labeled Faces in the Wild (LFW) Image Pairs dataset using Scikit-Learn.
    Pairs are either of the same person (matched) or different people (mismatched).
    """
    def __init__(self, subset='train', transform=None):
        print(f"Fetching LFW {subset} pairs... This may take a moment to download initially.")
        self.lfw = fetch_lfw_pairs(subset=subset, color=True, resize=1.0)
        self.pairs = self.lfw.pairs # Shape: (n_pairs, 2, h, w, c)
        self.target = self.lfw.target # Shape: (n_pairs,) - 1 for same, 0 for different
        self.transform = transform
        
    def __len__(self):
        return len(self.target)
        
    def __getitem__(self, idx):
        # Convert float32 image representation back to uint8 for PIL
        img1 = (self.pairs[idx, 0] * 255).astype(np.uint8)
        img2 = (self.pairs[idx, 1] * 255).astype(np.uint8)
        
        img1 = Image.fromarray(img1)
        img2 = Image.fromarray(img2)
        
        if self.transform:
            img1 = self.transform(img1)
            img2 = self.transform(img2)
            
        # Target: 1.0 represents same identity, 0.0 represents different identities
        target = torch.tensor(self.target[idx], dtype=torch.float32)
        
        return img1, img2, target

def get_dataloaders(batch_size=32):
    transform = transforms.Compose([
        transforms.Resize((128, 128)),  # Standardize image size for our CNN backbone
        transforms.ToTensor(),
        # Normalize with ImageNet stats to align with pre-trained ResNet weights
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    train_dataset = LFWPairsDataset(subset='train', transform=transform)
    test_dataset = LFWPairsDataset(subset='test', transform=transform)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    
    return train_loader, test_loader

if __name__ == "__main__":
    train_loader, test_loader = get_dataloaders(batch_size=8)
    for img1, img2, target in train_loader:
        print(f"Batch Image 1 shape: {img1.shape}")
        print(f"Batch Image 2 shape: {img2.shape}")
        print(f"Match Targets: {target}")
        break
