# ==========================================
# 1. SETUP & INSTALLATION CHECKS
# ==========================================
# Checking if required packages are installed
if (!requireNamespace("BiocManager", quietly = TRUE)) install.packages("BiocManager")
if (!requireNamespace("dada2", quietly = TRUE)) BiocManager::install("dada2", update=FALSE, ask=FALSE)
if (!requireNamespace("Biostrings", quietly = TRUE)) BiocManager::install("Biostrings", update=FALSE, ask=FALSE)

library(dada2)
library(Biostrings)

# Point R to your specific project folder
setwd("F:/DataAnalysis/VERTICAL_ALGAS/RDP-classifier")

# Define file paths (Make sure fasta_path matches your actual file)
fasta_path        <- "1_Sediment_16S_groups.fasta"
midori_genus_db   <- "MIDORI2_UNIQ_NUC_GB270_lrRNA_DADA2_toGenus.fasta"
midori_species_db <- "MIDORI2_UNIQ_NUC_GB270_lrRNA_DADA2_assignSpecies.fasta"

THREADS <- 30
CONFIDENCE <- 80

# ==========================================
# 2. STEP ONE: RDP CLASSIFIER (WITH BOOTSTRAPS)
# ==========================================
cat(sprintf("\n[%s] Starting MIDORI 2 Classification...\n", Sys.time()))

# Pass the fasta_path directly; DADA2 will use sequences as the rownames
taxa_results <- assignTaxonomy(
  fasta_path, 
  midori_genus_db, 
  multithread=THREADS, 
  minBoot=CONFIDENCE, 
  outputBootstraps=TRUE
)

taxa_matrix <- taxa_results$tax
boot_matrix <- taxa_results$boot

# ── CRITICAL FIX: RENAME COLUMNS ──────────────────────────────────────────
# MIDORI headers usually lack "Kingdom". We rename columns to match 
# the actual contents so addSpecies works correctly.
new_ranks <- c("Phylum", "Class", "Order", "Family", "Genus")

if(ncol(taxa_matrix) == 5) {
  colnames(taxa_matrix) <- new_ranks
  colnames(boot_matrix) <- new_ranks
}
# ──────────────────────────────────────────────────────────────────────────

# ==========================================
# 3. STEP TWO: EXACT MATCH (SPECIES LEVEL)
# ==========================================
cat(sprintf("[%s] Starting Exact-Match Species Assignment...\n", Sys.time()))

# addSpecies will find the "Genus" column and append the "Species" column
taxa_species_matrix <- addSpecies(taxa_matrix, midori_species_db, allowMultiple=FALSE)

# ==========================================
# 4. PREPARE DATAFRAMES
# ==========================================
cat(sprintf("[%s] Formatting Output Matrices...\n", Sys.time()))

# Convert Taxonomy Matrix to Dataframe
tax_df <- as.data.frame(taxa_species_matrix, stringsAsFactors = FALSE)
tax_df$Sequence <- rownames(tax_df)

# Convert Bootstrap Matrix to Dataframe and add "_boot" suffix
boot_df <- as.data.frame(boot_matrix, stringsAsFactors = FALSE)
colnames(boot_df) <- paste0(colnames(boot_df), "_boot")
boot_df$Sequence <- rownames(boot_df)

# ==========================================
# 5. RESTORE FASTA HASHES (MERGE STRATEGY)
# ==========================================
cat(sprintf("[%s] Restoring original FASTA hashes...\n", Sys.time()))

# Read original FASTA to get the Hash_IDs
fasta_data <- readDNAStringSet(fasta_path)
map_df <- data.frame(
  Hash_ID = names(fasta_data), 
  Sequence = as.character(fasta_data), 
  stringsAsFactors = FALSE
)

# Merge Taxonomy onto Map
final_df <- merge(map_df, tax_df, by="Sequence", all.x=TRUE)

# Merge Bootstraps onto the new combined Map
final_df <- merge(final_df, boot_df, by="Sequence", all.x=TRUE)

# Reorder columns to: Hash_ID -> Sequence -> Taxa Columns -> Bootstrap Columns
tax_cols <- setdiff(colnames(tax_df), "Sequence")
boot_cols <- setdiff(colnames(boot_df), "Sequence")

final_df <- final_df[, c("Hash_ID", "Sequence", tax_cols, boot_cols)]

# ==========================================
# 6. SAVE THE RESULTS
# ==========================================
output_file <- "1_Sediment_16S_groups.csv"
write.csv(final_df, output_file, row.names=FALSE)

cat(sprintf("\n[%s] PIPELINE COMPLETE!\n", Sys.time()))
cat(sprintf("Output saved to: %s\n", output_file))