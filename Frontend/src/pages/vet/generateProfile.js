const fs = require('fs');
const inputFile = 'd:/Pet Care V2/PetCare-2025/Frontend/src/pages/vet/PetProfile_backup.jsx';
const outputFile = 'd:/Pet Care V2/PetCare-2025/Frontend/src/pages/vet/PetProfile.jsx';

let original = fs.readFileSync(inputFile, 'utf-8');

// 1. imports
original = original.replace('} from \'@mui/material\';', ', Dialog, DialogTitle, DialogContent, DialogActions, Link } from \'@mui/material\';');

// 2. add states
let stateStr = `  const [activeTab, setActiveTab] = useState(0);

  // New Modal States
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [showMedForm, setShowMedForm] = useState(false);
  const [showPresForm, setShowPresForm] = useState(false);

  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showApptModal, setShowApptModal] = useState(false);
`;
original = original.replace(/  const \[activeTab, setActiveTab\] = useState\(0\);[\s]*const \[loading, setLoading\] = useState\(true\);[\s]*\/\/ Independent form visibility[\s]*const \[showMedForm, setShowMedForm\] = useState\(false\);[\s]*const \[showPresForm, setShowPresForm\] = useState\(false\);/g, stateStr + `\n  const [loading, setLoading] = useState(true);\n`);

original = original.replace(/const \[activeTab[^]*?const \[loading, setLoading\] = useState\(true\);/, stateStr + '\n  const [loading, setLoading] = useState(true);');

// Let's rely on standard search and replace using JS string parsing block by block, as this is safer than large regexes.
// Let's just create a completely explicit Javascript string template. Let me write a python script that will generate the exact file using multiline string format and output it to PetProfile.jsx, bypassing any quoting issues.
