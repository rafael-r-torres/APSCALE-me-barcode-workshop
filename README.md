# Multi-Marker Metabarcoding Pipeline Workshop 🧬

[![Website Status](https://img.shields.io/website-up-down-green-red/https/rafael-r-torres.github.io/APSCALE-me-barcode-workshop/apscale.html.svg)](https://rafael-r-torres.github.io/APSCALE-me-barcode-workshop/apscale.html)

Welcome to the dedicated training portal and documentation repository for our molecular ecology research group. This repository contains the source code for a comprehensive guide on our standard computational workflow, tracking the journey from raw sequence reads all the way to ecological data analysis.

🌐 **[Access the Live Documentation Here](https://rafael-r-torres.github.io/APSCALE-me-barcode-workshop/apscale.html)**

---

## 🎯 Overview

This pipeline is designed to be fully reproducible, modular, and robust. We leverage environmental DNA (eDNA) and multi-marker approaches (such as COI, 18S, and 16S) tailored for marine biodiversity and aquaculture monitoring.

By standardizing our workflow across specific computational tools, we achieve:
- **Consistency**: All lab members utilize identical parameters, thresholds, and database configurations, ensuring results are directly comparable across multiple projects.
- **Scalability**: Heavy sequence-clustering tasks are pushed to cloud platforms (like Kaggle) to bypass local hardware limitations and maintain a standardized computing environment.
- **Flexibility**: A modular design ensures the pipeline operates seamlessly whether you are analyzing metazoans, eukaryotes, or bacteria.

---

## 🚀 Pipeline Modules

The workflow is broken down into three core modules. Each step requires specific inputs and generates outputs that feed directly into the subsequent phase of the analysis.

### 1. APSCALE Processing
Focuses on raw `fastq` processing, initial quality filtering, denoising/clustering to generate Exact Sequence Variants (ESVs), and preliminary taxonomic assignment utilizing custom-generated local databases (such as MIDORI or SILVA).
*👉 [Read the APSCALE Guide](https://rafael-r-torres.github.io/APSCALE-me-barcode-workshop/apscale.html)*

### 2. DADA2 & RDP in R
Implements advanced statistical denoising through DADA2 and conducts robust taxonomic classification utilizing the RDP Classifier algorithm.
*👉 [Read the DADA2 Guide](https://rafael-r-torres.github.io/APSCALE-me-barcode-workshop/dada2.html)*

### 3. Cloud Reproducibility (Kaggle)
Details the process of executing computationally demanding tasks in the cloud. This module covers setting up your Kaggle environment to bypass local resource bottlenecks and generating fully reproducible analytical figures.
*👉 [Read the Kaggle Guide](https://rafael-r-torres.github.io/APSCALE-me-barcode-workshop/kaggle.html)*

---

## 💻 Repository Structure

This repository acts as the source code for the GitHub Pages documentation website. 
- `/assets/`: Contains custom styling (`css/`), scripts (`js/`), and UI screenshots (`img/steps/`).
- `*.html`: The core content and layout structure for each module's documentation.
- `collect_fastq.py`, `run_MIDORI.R`: Helpful accessory scripts utilized throughout the pipeline.

## 🤝 Contribution

If you are a member of the research group and spot an outdated step or wish to contribute a new module to the pipeline documentation, please submit a Pull Request or notify the repository maintainer. 

---
*Developed for the Multi-Marker Metabarcoding Workshop.*
