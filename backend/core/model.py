import torch
import torch.nn as nn
import torchvision.models as models

class SiameseNetwork(nn.Module):
    """
    A unified Siamese Neural Network utilizing twin CNN architectures 
    sharing the exact same weights to compute identity embeddings.
    """
    def __init__(self, embedding_dim=128):
        super(SiameseNetwork, self).__init__()
        
        # Use a high-end pre-trained CNN (ResNet18) as the feature extraction backbone
        weights = models.ResNet18_Weights.DEFAULT if hasattr(models, "ResNet18_Weights") else None
        if weights:
            resnet = models.resnet18(weights=weights)
        else:
            resnet = models.resnet18(pretrained=True)
            
        # Remove the final 1000-class classification fully connected layer
        self.cnn = nn.Sequential(*list(resnet.children())[:-1])
        
        # Add a custom fully connected sequence to reduce higher-dimensional features
        # to our distinct identity embeddings.
        self.fc = nn.Sequential(
            nn.Linear(resnet.fc.in_features, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(inplace=True),
            nn.Linear(512, embedding_dim)
        )

    def forward_once(self, x):
        """Passes a single image through the network to generate an embedding."""
        output = self.cnn(x)
        output = output.view(output.size()[0], -1) 
        output = self.fc(output)
        
        # Critical Step: L2 normalization bounds the embedding in the feature space, 
        # ensuring that the Euclidean distance behaves robustly across batches.
        output = nn.functional.normalize(output, p=2, dim=1)
        return output

    def forward(self, input1, input2):
        """Passes both images through the identical twin networks."""
        embedding1 = self.forward_once(input1)
        embedding2 = self.forward_once(input2)
        return embedding1, embedding2

if __name__ == "__main__":
    # Test model shape configuration
    model = SiameseNetwork(embedding_dim=128)
    mock_img_1 = torch.randn(2, 3, 128, 128)
    mock_img_2 = torch.randn(2, 3, 128, 128)
    e1, e2 = model(mock_img_1, mock_img_2)
    print(f"Network successfully initialized. Embedding Shape: {e1.shape}")
