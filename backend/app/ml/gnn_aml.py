import numpy as np
import networkx as nx
from typing import Dict, Any, List, Tuple
from app.data.elliptic_loader import EllipticGraphLoader

class GNNAMLClassifier:
    """
    Temporal Graph Convolutional Network (GCN / GraphSAGE) Model for Bitcoin AML & Illicit Node Detection.
    Performs spectral graph convolutions over transaction topology to classify wallet transaction risk.
    """
    def __init__(self, hidden_dim: int = 32, num_classes: int = 3):
        self.loader = EllipticGraphLoader()
        self.hidden_dim = hidden_dim
        self.num_classes = num_classes
        self.graph = self.loader.graph
        self.nodes = list(self.graph.nodes())
        self.node_to_idx = {n: i for i, n in enumerate(self.nodes)}
        self.idx_to_node = {i: n for i, n in enumerate(self.nodes)}
        
        # Model weights
        self.W0 = None
        self.W1 = None
        self.is_trained = False

    def _build_feature_matrix(self) -> np.ndarray:
        """Extracts 5 normalized node features (risk, network_score, impact_usd, degree, cluster_id)."""
        N = len(self.nodes)
        features = np.zeros((N, 5), dtype=np.float32)

        for i, n in enumerate(self.nodes):
            attrs = self.graph.nodes[n]
            degree = self.graph.degree(n)
            features[i, 0] = attrs.get("risk_score", 0.1)
            features[i, 1] = attrs.get("network_score", 0.1)
            features[i, 2] = np.log1p(attrs.get("financial_impact_usd", 1000.0)) / 15.0
            features[i, 3] = float(degree) / 50.0
            features[i, 4] = float(attrs.get("cluster_id", 1)) / 25.0

        return features

    def _build_normalized_adjacency(self) -> np.ndarray:
        """Computes symmetric normalized Laplacian adjacency matrix A_hat = D^{-1/2} (A + I) D^{-1/2}."""
        N = len(self.nodes)
        A = np.eye(N, dtype=np.float32)  # Include self-loops

        for u, v in self.graph.edges():
            if u in self.node_to_idx and v in self.node_to_idx:
                i, j = self.node_to_idx[u], self.node_to_idx[v]
                A[i, j] = 1.0
                A[j, i] = 1.0  # Undirected propagation for GCN

        # Degree matrix D
        deg = np.sum(A, axis=1)
        deg_inv_sqrt = np.where(deg > 0, np.power(deg, -0.5), 0.0)
        D_inv_sqrt = np.diag(deg_inv_sqrt)

        A_hat = np.matmul(np.matmul(D_inv_sqrt, A), D_inv_sqrt)
        return A_hat

    def train_and_evaluate(self, epochs: int = 50, lr: float = 0.01) -> Dict[str, Any]:
        """
        Trains 2-Layer Graph Convolutional Network (GCN) using NumPy forward & backward propagation.
        Layer 1: H1 = ReLU(A_hat * X * W0)
        Layer 2: Z = Softmax(A_hat * H1 * W1)
        """
        np.random.seed(42)
        X = self._build_feature_matrix()
        A_hat = self._build_normalized_adjacency()
        N, in_dim = X.shape

        # Initialize weights Xavier / Glorot
        self.W0 = np.random.randn(in_dim, self.hidden_dim).astype(np.float32) * np.sqrt(2.0 / in_dim)
        self.W1 = np.random.randn(self.hidden_dim, self.num_classes).astype(np.float32) * np.sqrt(2.0 / self.hidden_dim)

        # Generate ground truth targets: Class 0 = Licit, Class 1 = Illicit, Class 2 = Unknown/Suspicious
        y_true = np.zeros((N, self.num_classes), dtype=np.float32)
        for i, n in enumerate(self.nodes):
            risk = self.graph.nodes[n].get("risk_score", 0.1)
            if risk >= 0.70:
                y_true[i, 1] = 1.0  # Illicit
            elif risk <= 0.30:
                y_true[i, 0] = 1.0  # Licit
            else:
                y_true[i, 2] = 1.0  # Unknown / Suspicious

        # Training loop
        loss_history = []
        for epoch in range(epochs):
            # Forward pass
            H0 = np.matmul(A_hat, X)
            Z1 = np.matmul(H0, self.W0)
            H1 = np.maximum(0, Z1)  # ReLU activation

            H1_agg = np.matmul(A_hat, H1)
            Z2 = np.matmul(H1_agg, self.W1)
            
            # Softmax
            exp_Z2 = np.exp(Z2 - np.max(Z2, axis=1, keepdims=True))
            probs = exp_Z2 / np.sum(exp_Z2, axis=1, keepdims=True)

            # Cross-entropy loss
            loss = -np.mean(np.sum(y_true * np.log(probs + 1e-9), axis=1))
            loss_history.append(float(loss))

            # Backward pass (GCN Gradients)
            dZ2 = (probs - y_true) / N
            dW1 = np.matmul(H1_agg.T, dZ2)
            dH1 = np.matmul(np.matmul(A_hat, dZ2), self.W1.T)
            dZ1 = dH1 * (Z1 > 0)
            dW0 = np.matmul(H0.T, dZ1)

            # Gradient update
            self.W0 -= lr * dW0
            self.W1 -= lr * dW1

        self.is_trained = True

        # Compute accuracy & metrics
        preds = np.argmax(probs, axis=1)
        targets = np.argmax(y_true, axis=1)
        acc = float(np.mean(preds == targets))

        # Identify top risk nodes
        top_risk_indices = np.argsort(probs[:, 1])[::-1][:10]
        top_risk_nodes = []
        for idx in top_risk_indices:
            top_risk_nodes.append({
                "entity_id": self.idx_to_node[idx],
                "illicit_probability": round(float(probs[idx, 1]), 4),
                "cluster_id": int(self.graph.nodes[self.idx_to_node[idx]].get("cluster_id", 1)),
                "financial_impact_usd": float(self.graph.nodes[self.idx_to_node[idx]].get("financial_impact_usd", 0.0))
            })

        return {
            "trained_nodes": N,
            "total_edges": self.graph.number_of_edges(),
            "epochs": epochs,
            "final_loss": round(float(loss_history[-1]), 4),
            "classification_accuracy": round(acc, 4),
            "top_illicit_nodes": top_risk_nodes
        }

# Global GNN Instance
gnn_model = GNNAMLClassifier()
