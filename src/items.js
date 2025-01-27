// import * as cheerio from "https://unpkg.com/cheerio@1.0.0/dist/commonjs/index.js";
// import { qtiTransform } from "https://unpkg.com/@citolab/qti-convert@0.2.14/dist/qti-transformer/index.js";
import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
// import { qtiTransformItem } from 'https://unpkg.com/@citolab/qti-components@latest/dist/qti-transformers/index.js';

export const items = [
  {
    name: "qti-media-interaction",
    href: "/mediainteraction2_1733330299/i6750689a6a48220241204153506ba07f670/qti.xml",
    canPreview: true,
  },
  {
    name: "qti-match",
    href: "/match_countries_and_languages_kmatch_interactiong_1733222762/i65fa92cd18f77397877024f23acefba/qti.xml",
    canPreview: true,
  },
  {
    name: "qti-upload",
    href: "/1spreadsheet_formulas_yfile_upload_interactionr_bis_1733221755/i65fabc86a4e605242b00a1b14c69b11a/qti.xml",
    canPreview: true,
  },
  {
    name: "qti-slider",
    href: "/calculate_a_percentage_wslider_interactionp_1733221828/i65fa9289b8cf1392785884f843ee7cb/qti.xml",
    canPreview: true,
  },
  {
    name: "qti-select-point",
    href: "/select_point_interaction_1736413753/i677f91b17e11b20250109100657d9f749fa/qti.xml",
    canPreview: true,
  },
  {
    name: "qti-graphic-order",
    href: "/graphic_order_interaction_1_1736259693/i677d382b5a4d020250107152027b2ab8d7d/qti.xml",
    canPreview: true,
  },
  {
    name: "qti-pci",
    href: "/likert_pci_1733224036/i674ee5ef802e720241203120519e9a798a4/qti.xml",
    canPreview: false,
  },
  {
    name: "qti-pci-decision",
    href: "/decision_pci/i605b50d60c465892a88c0651ffd390/qti.xml",
    canPreview: false, // Only 1 of the same PCI can be rendered at a time
  },
];

async function fetchXMLFile(url) {
  try {
    const response = await fetch(url);

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the content as a string
    const xmlContent = await response.text();
    return xmlContent;
  } catch (error) {
    console.error("Error fetching XML file:", error);
    throw error; // Optional: rethrow the error for further handling
  }
}

async function transformQti(qtiString, url, path) {
  let body = { qti: qtiString };
  if (path) {
    body = { ...body, path };
  }
  try {
    const response = await fetch(url, {
      method: "POST", // Specify the HTTP method as POST
      headers: {
        "Content-Type": "application/json", // Set the content type to JSON
      },
      body: JSON.stringify(body), // Send the qti string as a JSON body
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // /qti-tools/qti3/fixes
    const result = await response.text(); // Assuming the server returns JSON

    return result;
  } catch (error) {
    console.error("Error posting QTI:", error);
    throw error; // Optional: rethrow the error for further handling
  }
}

function getDirectoryName(href) {
  const url = new URL(
    href.startsWith("http")
      ? removeDoubleSlashes(href)
      : removeDoubleSlashes(window.location.href + "/" + href)
  ); // Create a URL object
  const path = url.pathname; // Get the pathname (e.g., "/folder/subfolder/file.html")
  const directory = path.substring(0, path.lastIndexOf("/")); // Remove the last segment (file name)
  return directory || "/"; // If there's no directory, return "/"
}

function removeDoubleSlashes(str) {
  const singleForwardSlashes = str
    .replace(/([^:]\/)\/+/g, "$1")
    .replace(/\/\//g, "/")
    .replace("http:/", "http://")
    .replace("https:/", "https://");
  return singleForwardSlashes;
}

export async function getItemDoc(name) {
  const item = items.find((i) => i.name === name);
  const qti2 = await fetchXMLFile(item.href);
  const qti3 = await transformQti(
    qti2,
    "https://europe-west4-qti-convert.cloudfunctions.net/api/qti-tools/2_3/convert"
  );

  const makeAbsolutePath = (mediaLocation, relativePath) => {
    return removeDoubleSlashes(`${mediaLocation}/${relativePath}`);
  };
  const path = getDirectoryName(item.href);
  const transformResult = qtiTransform(qti3)
    .objectToImg()
    .objectToVideo()
    .objectToAudio()
    .upgradePci()
    .changeAssetLocation((url) => {
      const newUrl = makeAbsolutePath(path, url);
      return newUrl;
    });
  const qtiDoc = transformResult.browser.htmldoc();
  return qtiDoc;
}
