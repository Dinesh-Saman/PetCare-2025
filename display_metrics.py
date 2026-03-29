import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

def main():
    try:
        df = pd.read_csv("evaluation_results_40.csv")
    except Exception as e:
        print("Error: Could not find 'evaluation_results_40.csv'. Please make sure to run 'evaluate_chatbot.py' first.")
        return

    y_true = df["actual"]
    y_pred = df["pred"]

    # Calculate Standard Metrics
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_true, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)

    print("\n" + "="*45)
    print(" 🏥 PAWPAL CHATBOT EVALUATION METRICS REPORT")
    print("="*45)
    print(f"🎯 Accuracy:       {accuracy:.4f}  ({(accuracy*100):.1f}%)")
    print(f"📊 Precision:      {precision:.4f}  ({(precision*100):.1f}%)")
    print(f"🔄 Recall:         {recall:.4f}  ({(recall*100):.1f}%)")
    print(f"📈 F1 Score:       {f1:.4f}  ({(f1*100):.1f}%)")
    print("="*45)
    print("\n[+] Success: Popping up your generated charts now! Close the image window to exit script.")

    # Create a nice wide layout to display both images side by side!
    fig, axes = plt.subplots(1, 2, figsize=(18, 8))
    fig.canvas.manager.set_window_title('Chatbot Evaluation Results - Visualizations')

    # Load and render Confusion Matrix
    try:
        img_cm = mpimg.imread("domain_confusion_matrix.png")
        axes[0].imshow(img_cm)
        axes[0].axis('off')
    except Exception:
        axes[0].text(0.5, 0.5, "❌ domain_confusion_matrix.png Not Found", ha='center', va='center')
        axes[0].axis('off')

    # Load and render ROC Curve
    try:
        img_roc = mpimg.imread("domain_roc_curve.png")
        axes[1].imshow(img_roc)
        axes[1].axis('off')
    except Exception:
        axes[1].text(0.5, 0.5, "❌ domain_roc_curve.png Not Found", ha='center', va='center')
        axes[1].axis('off')

    plt.tight_layout()
    
    # This pops up the two images smoothly side-by-side!
    plt.show()

if __name__ == "__main__":
    main()
