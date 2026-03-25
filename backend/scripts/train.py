import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from tqdm import tqdm
import os
import sys

# Add backend root to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from core.dataset import get_dataloaders
from core.model import SiameseNetwork

class ContrastiveLoss(nn.Module):
    """
    Contrastive loss function penalizes large distance among positive pairs 
    and small dishance among negative pairs.
    """
    def __init__(self, margin=2.0):
        super(ContrastiveLoss, self).__init__()
        self.margin = margin

    def forward(self, output1, output2, label):
        # label == 1 means same identity, label == 0 means different identity
        euclidean_distance = F.pairwise_distance(output1, output2, keepdim=True)
        
        loss_contrastive = torch.mean((label) * torch.pow(euclidean_distance, 2) +
            (1 - label) * torch.pow(torch.clamp(self.margin - euclidean_distance, min=0.0), 2))
        return loss_contrastive

def train_model():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Training on device: {device}")
    
    # Core hyperparameters
    num_epochs =20
    batch_size = 32
    learning_rate = 0.0005
    
    # Initialize DataLoader, Model, Loss, matching dimensions
    train_loader, test_loader = get_dataloaders(batch_size=batch_size)
    
    model = SiameseNetwork(embedding_dim=128).to(device)
    criterion = ContrastiveLoss(margin=2.0)
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    best_loss = float('inf')
    
    for epoch in range(num_epochs):
        model.train()
        train_loss = 0.0
        
        print(f"Epoch {epoch+1}/{num_epochs}")
        for i, (img1, img2, target) in enumerate(tqdm(train_loader, desc="Training Batch")):
            img1, img2, target = img1.to(device), img2.to(device), target.to(device)
            
            # Forward pass
            optimizer.zero_grad()
            emb1, emb2 = model(img1, img2)
            
            # Loss and backprop
            loss = criterion(emb1, emb2, target.view(-1, 1))
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            
        avg_train_loss = train_loss / len(train_loader)
        
        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for img1, img2, target in tqdm(test_loader, desc="Validation Batch"):
                img1, img2, target = img1.to(device), img2.to(device), target.to(device)
                emb1, emb2 = model(img1, img2)
                loss = criterion(emb1, emb2, target.view(-1, 1))
                val_loss += loss.item()
                
        avg_val_loss = val_loss / len(test_loader)
        
        print(f"==> Avg Train Loss: {avg_train_loss:.4f}  |  Avg Val Loss: {avg_val_loss:.4f}\n")
        
        # Save best model
        if avg_val_loss < best_loss:
            best_loss = avg_val_loss
            weights_dir = os.path.join(os.path.dirname(__file__), "..", "weights")
            os.makedirs(weights_dir, exist_ok=True)
            weights_path = os.path.join(weights_dir, "siamese_model.pth")
            print(f"New best validation loss! Saving model to {weights_path}")
            torch.save(model.state_dict(), weights_path)

if __name__ == "__main__":
    train_model()
