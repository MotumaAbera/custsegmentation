import uuid
from pathlib import Path
from typing import BinaryIO

import matplotlib.pyplot as plt
import pandas as pd

from app.core.config import settings


def save_uploaded_file(file: BinaryIO, filename: str) -> str:
    upload_dir = settings.upload_path
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    file_path = upload_dir / unique_name

    with open(file_path, "wb") as buffer:
        content = file.read()
        buffer.write(content)

    return str(file_path)


def load_csv(file_path: str) -> pd.DataFrame:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"CSV file not found: {file_path}")

    df = pd.read_csv(path)
    return df


def save_dendrogram(fig, run_id: int) -> str:
    output_dir = settings.output_path
    filename = f"dendrogram_run_{run_id}.png"
    file_path = output_dir / filename

    fig.savefig(file_path, dpi=150, bbox_inches="tight", facecolor="white")

    return str(file_path)


def save_scatter_plot(fig, run_id: int) -> str:
    output_dir = settings.output_path
    filename = f"scatter_plot_run_{run_id}.png"
    file_path = output_dir / filename

    fig.savefig(file_path, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(fig)

    return str(file_path)


def save_distribution_chart(fig, run_id: int) -> str:
    output_dir = settings.output_path
    filename = f"distribution_run_{run_id}.png"
    file_path = output_dir / filename

    fig.savefig(file_path, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(fig)

    return str(file_path)
