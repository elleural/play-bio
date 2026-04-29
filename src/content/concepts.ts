import { ConceptRef } from "../types";

export const CONCEPTS: Record<string, ConceptRef> = {
  nucleotide: {
    id: "nucleotide",
    name: "Nucleotide",
    campbellRef: "Campbell Ch 5.5",
    oneLine: "The repeating building block of nucleic acids.",
    explanation:
      "A nucleotide is a small molecule made of three parts: a phosphate group, a sugar (deoxyribose in DNA, ribose in RNA), and one nitrogenous base. Nucleotides link through their sugar and phosphate to form the long backbones of DNA and RNA. The base is the part that carries information.",
  },
  backbone: {
    id: "backbone",
    name: "Sugar-phosphate backbone",
    campbellRef: "Campbell Ch 5.5",
    oneLine: "The structural rail of a DNA or RNA strand.",
    explanation:
      "When nucleotides polymerize, their sugar and phosphate groups link covalently to form a continuous backbone. The bases stick out from this backbone like teeth on a comb, ready to pair with bases on another strand.",
  },
  basePairing: {
    id: "basePairing",
    name: "Complementary base pairing",
    campbellRef: "Campbell Ch 5.5, 16.1",
    oneLine: "Adenine pairs with thymine; guanine pairs with cytosine.",
    explanation:
      "Hydrogen bonds form between specific bases: adenine-thymine (2 bonds) and guanine-cytosine (3 bonds). No other combinations form stable pairs. This selectivity is what allows one strand to act as a template for the other.",
  },
  hydrogenBond: {
    id: "hydrogenBond",
    name: "Hydrogen bonds",
    campbellRef: "Campbell Ch 5.5",
    oneLine: "Weak attractions that hold complementary bases together.",
    explanation:
      "Two hydrogen bonds form between A and T; three form between G and C. Each bond is weak alone, but many of them along a strand make the double helix stable. They also break easily when needed for replication or transcription.",
  },
  templateProduct: {
    id: "templateProduct",
    name: "Template and product strands",
    campbellRef: "Campbell Ch 16.2, 17.2",
    oneLine: "A template is read; a product is built from it.",
    explanation:
      "During replication, an existing strand serves as a template that specifies the order of bases on the new product strand through complementary pairing. The product is not a copy of the template, it is its complement.",
  },
  polymerase: {
    id: "polymerase",
    name: "DNA polymerase",
    campbellRef: "Campbell Ch 16.2",
    oneLine: "An enzyme that builds DNA strands using a template.",
    explanation:
      "DNA polymerase reads a template strand and adds nucleotides one at a time to the growing product strand. It only adds a nucleotide when the base correctly pairs with the template, and it can also remove and replace bases that slip past this check.",
  },
  proofreading: {
    id: "proofreading",
    name: "Proofreading",
    campbellRef: "Campbell Ch 16.2",
    oneLine: "Catching and replacing wrong bases as they are added.",
    explanation:
      "DNA polymerase pauses when it adds a base that does not pair correctly with the template. It can remove the mismatched base and try again, dramatically reducing the error rate of replication.",
  },
  mismatch: {
    id: "mismatch",
    name: "Mismatch",
    campbellRef: "Campbell Ch 16.2, 17.5",
    oneLine: "A base on the new strand that does not pair with the template.",
    explanation:
      "A mismatch is a single position where complementary base pairing fails. If repair systems do not correct it, it becomes a mutation that can change the meaning of a gene downstream.",
  },
  mutation: {
    id: "mutation",
    name: "Mutation",
    campbellRef: "Campbell Ch 17.5",
    oneLine: "A persistent change in the DNA sequence.",
    explanation:
      "Mutations include base substitutions and small insertions or deletions. Some are silent, some change a single amino acid, and some create or destroy stop signals during translation. The first line of defense against them is correct base pairing followed by proofreading and repair.",
  },
};

export const conceptList = (ids: string[]): ConceptRef[] =>
  ids.map((id) => CONCEPTS[id]).filter(Boolean);
