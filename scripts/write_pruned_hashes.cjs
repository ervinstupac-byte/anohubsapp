const fs = require('fs');
const data = [
  { "file": "public\\archive\\case-studies\\cs-compliance-shield\\index.html", "hash": "fb3ebeef268ab8c447cbe494d3a76cc928a5eefcd7b09207c5ba3586307e801b" },
  { "file": "public\\archive\\case-studies\\cs-compliance-shield\\index_2.html", "hash": "0f6cd97c1c7a465813e0477dc6fbf4cd2598f976b7d4ec5c310364d3aa8fbf07" },
  { "file": "public\\archive\\case-studies\\cs-compliance-shield\\index_3.html", "hash": "e6c4287a88aba17327a1a9e7b685718e9772fa039255e8a66abac47c08c2e3b9" },
  { "file": "public\\archive\\case-studies\\cs-compliance-shield\\index_4.html", "hash": "8d726ec1697a69eb2baad5f8fbd2a355f60a609edc8492c776cac393d6f27e92" },
  { "file": "public\\archive\\case-studies\\cs-compliance-shield\\index_5.html", "hash": "f67861f67066775e3e93a10b54703a469de42e1528fdf541c32572c58f49dd0c" },
  { "file": "public\\archive\\case-studies\\cs-compliance-shield\\index_6.html", "hash": "9e8a1bebf10e6432d6580d1a508cb9bf2cfb8a60e07c6872a62b22738a2e362c" },
  { "file": "public\\archive\\case-studies\\cs-compliance-shield\\index_7.html", "hash": "b7d036a21b5ea336d0af585e12f169124921a5c51a4d0ccc5b3e9dd4f36c32c9" },
  { "file": "public\\archive\\case-studies\\cs-compliance-shield\\index_8.html", "hash": "80866e7a1827f89ce09f0decc162e3ee6670e134e9331ba9764934e270be5c8a" }
];
fs.writeFileSync('scripts/hashes_applied.json', JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('wrote pruned manifest');
