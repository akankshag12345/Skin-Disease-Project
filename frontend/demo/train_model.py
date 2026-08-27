from fastai.vision.all import *
import multiprocessing

def main():
    # 1. Dataset path (UNZIPPED FOLDER)
    path = Path(r"C:\Users\gurav\Downloads\archive (1)")

    # 2. DataLoaders
    dls = ImageDataLoaders.from_folder(
        path,
        valid_pct=0.2,
        item_tfms=Resize(224),
        batch_tfms=aug_transforms(
            flip_vert=True,
            max_rotate=20,
            max_zoom=1.2,
            max_lighting=0.3,
            max_warp=0.2
        ),
        num_workers=0
    )

    # 3. Learner
    learn = vision_learner(
        dls,
        resnet34,
        metrics=accuracy
    )

    # 🔥 STEP 6 — Find best learning rate FIRST
    learn.lr_find()

    # 🔥 Train using suggested LR (example: 1e-3)
    learn.fine_tune(15, base_lr=1e-3)

    # 4. Save model
    model_path = Path(
        r"C:\Users\gurav\OneDrive\Desktop\frontend\demo\trained_model.pkl"
    )
    learn.export(model_path)
    print(f"Model saved at: {model_path}")

if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
