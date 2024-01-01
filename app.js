import './app.css';
import {
  openAttestationDnsTxtIdentityProof,
  openAttestationEthereumDocumentStoreStatus,
  openAttestationHash,
  utils as verification,
  verificationBuilder,
} from '@govtechsg/oa-verify';

import {
  getData,
} from '@govtechsg/open-attestation';

const $file = document.getElementById("file");
const $loader = document.getElementById("loader");
const $output = document.getElementById("output");

function onFileChangeHandler() {
  const file = $file.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = decodeDocument;
  reader.readAsText(file);
}

async function decodeDocument({ target }) {
  const { result } = target
  let wrappedDocument;

  try {
    wrappedDocument = JSON.parse(result);
  } catch (e) {
    console.error(e)
    $output.innerHTML = `<p style="font-family: monospace; color: red;">${JSON.stringify(e.stack)}</p>`
    return;
  }

  $file.disabled = true;
  $loader.removeAttribute("hidden")
  $output.innerHTML = '';

  try {

    const documentData = getData(wrappedDocument);
    const provider = verification.generateProvider({
      network: documentData.network.chain.toLowerCase(),
    });

    const verifier = verificationBuilder(
      [
        openAttestationHash,
        openAttestationEthereumDocumentStoreStatus,
        openAttestationDnsTxtIdentityProof
      ],
      { provider }
    );

    const fragments = await verifier(wrappedDocument);
    $output.innerHTML =
      `<pre><code class="language-javascript">const fragments = ${JSON.stringify(fragments, null, 2)}\n\n` +
      `const data = ${JSON.stringify(documentData, null, 2)}</code><pre>`

    hljs.highlightAll();
  } catch (e) {
    $output.innerHTML = `<p style="font-family: monospace; color: red;">${JSON.stringify(e.stack)}</p>`
  } finally {
    $loader.setAttribute("hidden", "");
    $file.disabled = false;
  }
}

$file.addEventListener("input", onFileChangeHandler);
$file.addEventListener('change', () => {
  if ($file.files.length === 0) {
    $output.innerHTML = '';
  }
})