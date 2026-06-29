import pandas as pd
from Bio import SeqIO

def fasta_to_parquet(fasta_path, output_path):
    records = []
    for record in SeqIO.parse(fasta_path, "fasta"):
        records.append({
            "ID": record.id,
            "Sequence": str(record.seq),
            "Taxonomy": record.description.split("tax=")[-1] if "tax=" in record.description else "Unknown"
        })
    df = pd.DataFrame(records)
    df.to_parquet(output_path, engine='pyarrow')
    print(f"Successfully converted {fasta_path} to {output_path}")

if __name__ == '___main__':
    # Example usage
    # fasta_to_parquet("database.fasta", "database.parquet")
    pass
