---
title: Shadow Project
layout: default
parent: Project
nav_order: 3
permalink: /docs/Project/Project003
---

# ShadowProject

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Shadow Detection &amp; Removal 
 * Deep Learning code : /cGAN-ShadowRemove
 * Unity3d : /Web3DS

# Used Dataset

[1] ISTD Dataset : Dataset is available in GoogleDrive : https://drive.google.com/file/d/1I0qw-65KBA6np8vIZzO6oeiOvcDBttAY/view

[1] J. Wang, X. Li, and J. Yang. Stacked conditional generative adversarial networks for jointly learning shadow detection
and shadow removal. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, 2018

Image triplet structure
-----------------------
 * Shadow
 * Shadow-mask
 * Shadow-free

# Train Run example
<pre><code>python train_model_shadow.py
</code></pre>

# Test
 * run test.ipynb
