import { useEffect, useState } from "react";
import { getAvailableGenomes , getGenomeChromosomes , searchGenes } from "../utils/genome-api";
import { Search } from "lucide-react";
import GeneViewer from "../components/gene-viewer";


export default function HomePage() {
  const [genomes, setGenomes] = useState([]);
  const [selectedGenome, setSelectedGenome] = useState("hg38");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chromosomes,setChromosomes] = useState([]);
  const [selectedChromosome, setSelectedChromosome] = useState("chr1");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mode,setMode] = useState("search");
  const [activeTab, setActiveTab] = useState(mode || "search");
  const [selectedGene,setSelectedGene] =useState(null);

  const handleGenomeChange = (e) => {
    setSelectedGenome(e.target.value);
    //reseting the search results after the genome assembly changed
    setSearchResults([]);
    setSelectedGene(null)
  };

  const switchMode=(newmode)=>{
    if(newmode === mode) return;

    setSearchResults([]);
    //clearing the errors when the user switches to other tab

    setSelectedGene(null)
    setError(null);

    if (newmode === "browse" && selectedChromosome) {
        performGeneSearch(
            selectedChromosome,
            selectedGenome,
            (gene) => gene.chrom === selectedChromosome
        );
    }

    setMode(newmode);
  }

  const loadBRCA1Example = ()=>{
    setMode("search");
    setSearchQuery("BRCA1");
    //handling the actual searching
    //and when the user click on the braca directly perform the search functionality
    performGeneSearch("BRCA1",selectedGenome);
  }

  const handleSearch = async (e) =>{
    if(e) e.preventDefault();
    if(!searchQuery.trim()) return;
    performGeneSearch(searchQuery, selectedGenome);
  }

  useEffect(() => {
    const fetchGenomes = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableGenomes();
        if (data.genomes && data.genomes["Human"]) {
          setGenomes(data.genomes["Human"]);
        }
      } catch (err) {
        setError("Failed to load genome data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenomes();
  }, []);

    useEffect(() => {
    const fetchChromosomes = async () => {
      try {
        setIsLoading(true);
        const data = await getGenomeChromosomes(selectedGenome);
        setChromosomes(data.chromosomes)
        // console.log(data.chromosomes)
        if (data.chromosomes.length>0) {
          setSelectedChromosome(data.chromosomes[0].name)
        }
      } catch (err) {
        setError("Failed to load chromosome data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChromosomes();
  }, [selectedGenome]);

  const performGeneSearch = async (query, genome, filterFn) => {
    try {
        setIsLoading(true);
        const data = await searchGenes(query, genome);
        const results = filterFn ? data.results.filter(filterFn) : data.results;
        console.log(results);
        setSearchResults(results);
    } catch (err) {
        setError("Failed to search genes");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
      if (!selectedChromosome || mode !== "browse") return;
      performGeneSearch(
          selectedChromosome,
          selectedGenome,
          (gene) => gene.chrom === selectedChromosome
      );
  }, [selectedChromosome, selectedGenome, mode]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <div className="relative">
            <h1 className="text-2xl font-bold tracking-wide text-[#0a66c2]">
              EVO<span className="text-orange-500">2</span>
            </h1>
            <div className="absolute -bottom-1 left-0 h-[3px] w-14 bg-orange-500 rounded-full"></div>
          </div>
          <span className="text-base font-light text-gray-600">
            Variant Analysis
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-8">
        {selectedGene ? 
        <GeneViewer
            gene={selectedGene}
            genomeId={selectedGenome}
            onClose={() => setSelectedGene(null)}
          /> : 

        <>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">
              Genome Assembly
            </h2>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0a66c2] text-xs font-medium">
              Organism: Human
            </span>
          </div>

          {/* Dropdown */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Genome Assembly
          </label>
          <select
            value={selectedGenome}
            onChange={handleGenomeChange}
            disabled={isLoading}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] transition"
          >
            <option value="">
              {isLoading ? "Loading genomes..." : "Select genome assembly"}
            </option>
            {genomes.map((genome) => (
              <option key={genome.id} value={genome.id}>
                {genome.id} - {genome.name}
                {genome.active ? " (active)" : ""}
              </option>
            ))}
          </select>

          {/* Source Info */}
          {selectedGenome && !isLoading && (
            <p className="mt-3 text-sm text-gray-600 italic">
              Source:{" "}
              {
                genomes.find((genome) => genome.id === selectedGenome)
                  ?.sourceName
              }
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-medium text-gray-600">Browse</h2>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="mb-4 flex gap-1 rounded-md bg-gray-100 p-1">
          <button
            onClick={() => {
              setActiveTab("search");
              switchMode("search");
            }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              activeTab === "search"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Search Genes
          </button>
          <button
            onClick={() => {
              setActiveTab("browse");
              switchMode("browse");
            }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              activeTab === "browse"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Browse Chromosomes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter gene symbol or name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 pr-10 text-sm shadow-sm focus:border-[#3c4f3d] focus:outline-none focus:ring-1 focus:ring-[#3c4f3d]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="absolute right-0 top-0 flex h-full w-10 items-center justify-center rounded-r-md bg-[#3c4f3d] text-white transition hover:bg-[#2e3a2f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
            <button
              onClick={loadBRCA1Example}
              className="text-sm text-[#de8246] transition hover:text-[#c76e36]"
            >
              Try BRCA1 example
            </button>
          </div>
        )}

        {activeTab === "browse" && (
          <div className="max-h-[150px] overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
              {chromosomes.map((chrom) => (
                <button
                  key={chrom.name}
                  onClick={() => setSelectedChromosome(chrom.name)}
                  className={`h-8 rounded-md border border-gray-300 px-3 text-sm transition hover:bg-gray-100 ${
                    selectedChromosome === chrom.name
                      ? "bg-gray-100 text-gray-800"
                      : "text-gray-600"
                  }`}
                >
                  {chrom.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loader */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#de8243]"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

            {searchResults.length > 0 && !isLoading && (
            <div className="mt-6">
              {/* Header */}
              <div className="mb-2">
                <h4 className="text-xs font-normal text-[#3c4f3d]/70">
                  {mode === "search" ? (
                    <>
                      Search Results:{" "}
                      <span className="font-medium text-[#3c4f3d]">
                        {searchResults.length} genes
                      </span>
                    </>
                  ) : (
                    <>
                      Genes on {selectedChromosome}:{" "}
                      <span className="font-medium text-[#3c4f3d]">
                        {searchResults.length} found
                      </span>
                    </>
                  )}
                </h4>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-md border border-[#3c4f3d]/5 shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#e9eeea]/50">
                      <th className="px-4 py-2 text-left text-xs font-normal text-[#3c4f3d]/70">
                        Symbol
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-normal text-[#3c4f3d]/70">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-normal text-[#3c4f3d]/70">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((gene, index) => (
                      <tr
                        key={`${gene.symbol}-${index}`}
                        className="cursor-pointer border-b border-[#3c4f3d]/5 transition-colors hover:bg-[#e9eeea]/50"
                        onClick={() => setSelectedGene(gene)}
                      >
                        <td className="px-4 py-2 font-medium text-[#3c4f3d]">
                          {gene.symbol}
                        </td>
                        <td className="px-4 py-2 font-medium text-[#3c4f3d]">
                          {gene.name}
                        </td>
                        <td className="px-4 py-2 font-medium text-[#3c4f3d]">
                          {gene.chrom}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && searchResults.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center text-center text-gray-400">
              <Search className="mb-4 h-10 w-10 text-gray-400" />
              <p className="text-sm leading-relaxed">
                {mode === "search"
                  ? "Enter a gene or symbol and click search"
                  : selectedChromosome
                  ? "No genes found on this chromosome"
                  : "Select a chromosome to view genes"}
              </p>
            </div>
          )}
      </div>
    </div>
   </>
  }
        
      </main>
    </div>
  );
}
