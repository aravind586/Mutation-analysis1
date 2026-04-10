export async function getAvailableGenomes() {
  const apiUrl = "https://api.genome.ucsc.edu/list/ucscGenomes";
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch genome list from UCSC API");
  }

  //getting the json data
  const genomeData = await response.json();
  if (!genomeData.ucscGenomes) {
    throw new Error("UCSC API error: missing ucscGenomes");
  }

  //getting only the specific genome data
  const genomes = genomeData.ucscGenomes;

  //creating a map for the above data so that the all the details about the specific organism will be displayed
  const structuredGenomes = {};




  //creating a map
  for (const genomeId in genomes) {
    //getting the every genome info on the basis of the genome id
    const genomeInfo = genomes[genomeId];
    const organism = genomeInfo.organism || "Other";

    //create a empty array if the organism not present in map
    if (!structuredGenomes[organism]) {
      structuredGenomes[organism] = [];
    }

    //if it is present in the map push the details mentioned belowed
    structuredGenomes[organism].push({
      id: genomeId,
      name: genomeInfo.description || genomeId,
      sourceName: genomeInfo.sourceName || genomeId,
      active: !!genomeInfo.active,
    });
  }

  //we are reuturning the map data
  return { genomes: structuredGenomes };
  //consists of {
  // organism: details about the genome id , genome description , sourceName and status--this could be array because for the same organism we may get  the different genes
  // }
}


// Function to get chromosomes for a specific genome from UCSC API
export async function getGenomeChromosomes(genomeId) {
  // Construct the API URL with the given genome ID
  const apiUrl = `https://api.genome.ucsc.edu/list/chromosomes?genome=${genomeId}`;

  // Fetch data from the UCSC API
  const response = await fetch(apiUrl);

  // If the response is not OK, throw an error
  if (!response.ok) {
    throw new Error("Failed to fetch chromosome list from UCSC API");
  }

  // Parse the JSON data from the API
  const chromosomeData = await response.json();

  // If chromosomes key is missing in the response, throw an error
  if (!chromosomeData.chromosomes) {
    throw new Error("UCSC API error: missing chromosomes");
  }

  // Initialize an empty array to store chromosome objects
  const chromosomes = [];

  // Loop through each chromosome entry returned by the API
  for (const chromId in chromosomeData.chromosomes) {
    // Skip chromosome IDs containing "_", "Un", or "random"
    if (
      chromId.includes("_") ||
      chromId.includes("Un") ||
      chromId.includes("random")
    ) {
      continue;
    }

    // Push chromosome object with name and size into the array
    chromosomes.push({
      name: chromId,
      size: chromosomeData.chromosomes[chromId],
    });
  }

  // Sort chromosomes in order: chr1, chr2, ..., chrX, chrY
  chromosomes.sort((a, b) => {
    // Remove "chr" prefix to compare numbers
    const anum = a.name.replace("chr", "");
    const bnum = b.name.replace("chr", "");

    // Check if both are numeric
    const isNumA = /^\d+$/.test(anum);
    const isNumB = /^\d+$/.test(bnum);

    // Sort numerically if both are numbers
    if (isNumA && isNumB) return Number(anum) - Number(bnum);

    // Ensure numeric chromosomes come before letter ones
    if (isNumA) return -1;
    if (isNumB) return 1;

    // For letters (X, Y), sort alphabetically
    return anum.localeCompare(bnum);
  });

  // Return the sorted chromosomes in an object
  return { chromosomes };
}

export async function searchGenes(query, genome) {
  // URL to fetch genes from NCBI
  const url = "https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search";

  // Adding params to the URL
  const params = new URLSearchParams({
    terms: query,
    df: "chromosome,symbol,description,map_location,type_of_gene",
    ef: "chromosome,symbol,description,map_location,type_of_gene,GenomicInfo,GeneID",
  });

  // Complete URL by combining both URL and params
  const response = await fetch(`${url}?${params}`);

  // Throws error if failed to fetch data from the API
  if (!response.ok) {
    throw new Error("NCBI API Error");
  }

  // Data contains the related gene by giving the ?terms=value
  const data = await response.json();

  // Results array
  const results = [];

  if (data[0] > 0) {
    // Contains null or values at index 2, in that value it contains GeneID
    const fieldMap = data[2];
    const geneIds = fieldMap.GeneID || [];

    // We will fetch max 10 or complete data present in the data[]
    for (let i = 0; i < Math.min(10, data[0]); ++i) {
      // Safety check to avoid out-of-bounds
      if (i < data[3].length) {
        try {
          const display = data[3][i];
          let chrom = display[0];
          if (chrom && !chrom.startsWith("chr")) {
            chrom = `chr${chrom}`;
          }
          results.push({
            symbol: display[2],
            name: display[3],
            chrom: chrom,
            description: display[3],
            gene_id: geneIds[i] || "",
          });
        } catch {
          continue;
        }
      }
    }
  }

  return { query, genome, results };
}


export async function fetchGeneSequence(chrom, start, end, genomeId) {
  try {
    const chromosome = chrom.startsWith("chr") ? chrom : `chr${chrom}`;

    const apiStart = start - 1;
    const apiEnd = end;

    const apiUrl = `https://api.genome.ucsc.edu/getData/sequence?genome=${genomeId};chrom=${chromosome};start=${apiStart};end=${apiEnd}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const actualRange = { start, end };

    if (data.error || !data.dna) {
      return { sequence: "", actualRange, error: data.error };
    }

    const sequence = data.dna.toUpperCase();

    return { sequence, actualRange };
  } catch (err) {
    return {
      sequence: "",
      actualRange: { start, end },
      error: "Internal error in fetch gene sequence",
    };
  }
}

export async function fetchGeneDetails(geneId) {
  try {
    const detailUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${geneId}&retmode=json`;
    const detailsResponse = await fetch(detailUrl);

    if (!detailsResponse.ok) {
      console.error(
        `Failed to fetch gene details: ${detailsResponse.statusText}`,
      );
      return { geneDetails: null, geneBounds: null, initialRange: null };
    }

    const detailData = await detailsResponse.json();

    if (detailData.result && detailData.result[geneId]) {
      const detail = detailData.result[geneId];

      if (detail.genomicinfo && detail.genomicinfo.length > 0) {
        const info = detail.genomicinfo[0];

        const minPos = Math.min(info.chrstart, info.chrstop);
        const maxPos = Math.max(info.chrstart, info.chrstop);
        const bounds = { min: minPos, max: maxPos };

        const geneSize = maxPos - minPos;
        const seqStart = minPos;
        const seqEnd = geneSize > 10000 ? minPos + 10000 : maxPos;
        const range = { start: seqStart, end: seqEnd };

        console.log(detail)
        return { geneDetails: detail, geneBounds: bounds, initialRange: range };
      }
    }

    return { geneDetails: null, geneBounds: null, initialRange: null };
  } catch (err) {
    return { geneDetails: null, geneBounds: null, initialRange: null };
  }
}


export async function fetchClinvarVariants(chrom, geneBound, genomeId) {
  const chromFormatted = chrom?.replace(/^chr/i, "") || "1";
  const minBound = Math.min(geneBound?.min || 100000, geneBound?.max || 200000);
  const maxBound = Math.max(geneBound?.min || 100000, geneBound?.max || 200000);
  const positionField = genomeId === "hg19" ? "chrpos37" : "chrpos38";

  let searchTerm = `${chromFormatted}[chromosome] AND ${minBound}:${maxBound}[${positionField}]`;
  console.log("[ClinVar] Primary search term:", searchTerm);

  let variants = await searchClinVar(searchTerm, chromFormatted);

  // 🧩 Fallback #1: Try single coordinate (minBound)
  if (!variants || variants.length === 0) {
    console.warn("[ClinVar] No results. Retrying with single position query...");
    const singlePosTerm = `${chromFormatted}[chromosome] AND ${minBound}[${positionField}]`;
    variants = await searchClinVar(singlePosTerm, chromFormatted);
  }

  // 🧩 Fallback #2: Use default chromosome 1 region (your URL)
  if (!variants || variants.length === 0) {
    console.warn("[ClinVar] Still no results. Using default fallback region...");
    const defaultTerm = `1[chromosome] AND 100000:200000[${positionField}]`;
    variants = await searchClinVar(defaultTerm, "1");
  }

  if (!variants || variants.length === 0) {
    console.error("[ClinVar] No variants found after all retries.");
  } else {
    console.log(`[ClinVar] ✅ Found ${variants.length} variants`);
  }

  return variants;
}

async function searchClinVar(searchTerm, chromFormatted) {
  try {
    const searchUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
    const searchParams = new URLSearchParams({
      db: "clinvar",
      term: searchTerm,
      retmode: "json",
      retmax: "20",
    });

    console.log("[ClinVar] 🔍 Searching:", `${searchUrl}?${searchParams.toString()}`);

    const searchResponse = await fetch(`${searchUrl}?${searchParams.toString()}`);
    if (!searchResponse.ok) {
      console.error("[ClinVar] esearch failed:", searchResponse.statusText);
      return [];
    }

    const searchData = await searchResponse.json();
    const variantIds = searchData.esearchresult?.idlist || [];
    console.log(`[ClinVar] Found ${variantIds.length} IDs`);

    if (variantIds.length === 0) return [];

    const summaryUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";
    const summaryParams = new URLSearchParams({
      db: "clinvar",
      id: variantIds.join(","),
      retmode: "json",
    });

    console.log("[ClinVar] 📄 Fetching summaries for IDs:", variantIds.join(","));

    const summaryResponse = await fetch(`${summaryUrl}?${summaryParams.toString()}`);
    if (!summaryResponse.ok) {
      console.error("[ClinVar] esummary failed:", summaryResponse.statusText);
      return [];
    }

    const summaryData = await summaryResponse.json();
    const variants = [];

    if (summaryData.result && summaryData.result.uids) {
      for (const id of summaryData.result.uids) {
        const v = summaryData.result[id];
        variants.push({
          clinvar_id: id,
          title: v.title,
          variation_type: (v.obj_type || "Unknown")
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" "),
          classification: v.germline_classification?.description || "Unknown",
          chromosome: chromFormatted,
          location: v.location_sort
            ? parseInt(v.location_sort).toLocaleString()
            : "Unknown",
        });
      }
    }

    return variants;
  } catch (err) {
    console.error("[ClinVar] ❌ Exception during search:", err);
    return [];
  }
}


export async function analyzeVariantWithAPI({
  position,
  alternative,
  genomeId,
  chromosome,
}) {
  const body = {
    variant_position: position,
    alternative: alternative,
    genome: genomeId,
    chromosome: chromosome,
  };

  const url = `https://venkateshbadamdurga--variant-analysis-evo2-evo2model-ana-ebe097.modal.run?`;
  // const url = `https://arunmouli36--variant-analysis-evo2-evo2model-analyze-998f60-dev.modal.run?`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    
  });


  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Failed to analyze variant " + errorText);
  }

  return await response.json();
}