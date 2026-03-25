import os
import sys
import torch
import torch.nn.functional as F

# Add backend root to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from core.dataset import get_dataloaders
from core.model import SiameseNetwork

def test_biometric_auth(threshold=1.0):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = SiameseNetwork(embedding_dim=128).to(device)
    
    # Load previously trained weights
    try:
        weights_path = os.path.join(os.path.dirname(__file__), "..", "weights", "siamese_model.pth")
        if hasattr(torch.serialization, 'add_safe_globals'):  # Check based on newer pyTorch capabilities
            model.load_state_dict(torch.load(weights_path, map_location=device, weights_only=True))
        else:
            model.load_state_dict(torch.load(weights_path, map_location=device))
    except FileNotFoundError:
        print(f"\n[WARNING] No trained weights found at {weights_path}. Run train.py first!")
        print("[WARNING] The model will demonstrate using randomly initialized (untrained) weights.\n")

    model.eval()
    
    # Set up simple dataloader to grab a handful of test pairs
    _, test_loader = get_dataloaders(batch_size=16)
    
    correct_auths = 0
    total_pairs = 0
    
    print("\n" + "="*60)
    print("BIOMETRIC FACE AUTHENTICATION DECISIONS (LFW DATASET)")
    print("="*60)
    
    with torch.no_grad():
        for i, (img1, img2, target) in enumerate(test_loader):
            img1, img2, target = img1.to(device), img2.to(device), target.to(device)
            if img1.size(0) == 0:
                continue

            # Pass images to model to determine biometric signature vectors
            emb1, emb2 = model(img1, img2)
            
            # Distance computation determines identity. Closer distance = likely same person
            distances = F.pairwise_distance(emb1, emb2).cpu().numpy()
            targets = target.cpu().numpy()
            
            for j in range(len(distances)):
                dist = distances[j]
                is_same_person = (targets[j] == 1.0)
                
                # Rule logic for granting access:
                # If similarity distance < threshold, grant access!
                access_granted = (dist < threshold)
                
                # Validation checks
                if access_granted == is_same_person:
                    correct_auths += 1
                total_pairs += 1
                
                # Formatting decision log
                ground_truth = "SAME PERSON" if is_same_person else "DIFFERENT PERSON"
                decision = "🟢 ACCESS GRANTED" if access_granted else "🔴 ACCESS DENIED"
                
                print(f"Pair {total_pairs:2d}: True Identity = {ground_truth:16s} | Distance = {dist:.4f} | System Decision = {decision}")
                
            break  # Break out to merely provide a concise demonstration of decision outcomes

    # Final summary statistics
    print("-" * 60)
    print(f"Demonstration Accuracy on {total_pairs} pairs: {(correct_auths/total_pairs)*100:.2f}%")
    print("\nNote: For maximum accuracy, ensure 'train.py' is run for 10-20 epochs.")
    print("      Additionally, optimal threshold may vary depending on training loss margin.\n")

if __name__ == "__main__":
    # Test our grant/deny logic via the evaluate script
    test_biometric_auth(threshold=1.0)
