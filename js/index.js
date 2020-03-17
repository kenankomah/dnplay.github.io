"use strict";

class CSVFile {
    constructor(buffer) {
        this.rows = [];
        this.headerToCol = {};
        if (buffer) {
            this.load(buffer);
        }
    }
    load(buffer) {
        for (let line of buffer.split('\n')) {
            let len = line.length;
            let i = 0;
            let row = new Array();
            while (i < len) {
                if (line[i++] != '"') {
                    throw new Error('InvalidCSV: ' + i + " vs " + line);
                }
                let next = line.indexOf('",', i);
                if (next == -1) {
                    next = line.indexOf('"\r');
                    if (next != -1) {
                        break;
                    }
                    next = line.indexOf('"\n');
                    if (next != -1) {
                        break;
                    }
                    throw new Error('InvalidCSV: ' + i + " vs " + line);
                }
                row.push(line.substr(i, next - i));
                i = next + 1;
                if (len - i <= 1) break;
                if (i < len && line[i++] != ',') {
                    throw new Error('InvalidCSV: ' + i + " vs " + line);
                }
            }
            this.rows.push(row);
        }
        this.generateHeaderMap();
    }
    generateHeaderMap() {
        let i = 0;
        while (i < this.rows[0].length) {
            this.headerToCol[this.rows[0][i]] = i++;
        }
    }
    getHaplogroupData(header) {
        let seen = new Set();
        let dna = {};
        let profileCol = this.headerToCol["Link to Profile Page"];
        // -1
        let haplogroupCol = this.headerToCol[header];
        // -1
        for (let i = 1; i < this.rows.length; ++i) {
            let profile = this.rows[i][profileCol];
            if (seen.has(profile)) {
                continue;
            }
            seen.add(profile);
            let paternalHaplogroup = this.rows[i][haplogroupCol];
            if (paternalHaplogroup != "" && paternalHaplogroup != undefined) {
                if (paternalHaplogroup in dna) {
                    dna[paternalHaplogroup] = dna[paternalHaplogroup] + 1;
                }
                else {
                    dna[paternalHaplogroup] = 1;
                }
            }
        }
        let haps = new Array();
        for (const key of Object.keys(dna)) {
            haps.push([key, dna[key]]);
        }
        haps.sort(function (x, y) {
            if (x[1] == y[1]) {
                if (x[0] < y[0])
                    return -1;
                if (x[0] > y[0])
                    return 1;
                return 0;
            }
            if (x[1] < y[1])
                return 1;
            if (x[1] > y[1])
                return -1;
            return 0;
        });
        return haps;
    }
}

function createTable(id, name, data) {
	let table = document.createElement('table');
	table.setAttribute('class', 'haplogroup-table');
	table.setAttribute('id', id);

	let tr = document.createElement('tr');
	let th = document.createElement('th');
	th.appendChild(document.createTextNode(name));
	tr.appendChild(th);
	th = document.createElement('th');
	th.appendChild(document.createTextNode('Count'));
	tr.append(th);
	table.appendChild(tr);

	for (let i = 0; i < data.length; ++i) {
		let tr = document.createElement('tr');
		let td = document.createElement('td');
		td.appendChild(document.createTextNode(data[i][0]));
		tr.appendChild(td);
		td = document.createElement('td');
		td.appendChild(document.createTextNode(data[i][1]));
		tr.append(td);
		table.appendChild(tr);
	}

	return table;
}

function doFileStuff(file) {
	var reader = new FileReader();

	reader.onload = function(e) {
		let x = new CSVFile(e.target.result);
		let mHaplogroups = x.getHaplogroupData('Maternal Haplogroup');
		let pHaplogroups = x.getHaplogroupData('Paternal Haplogroup');

		let t1 = createTable('maternal-haplogroup', 'mtDNA Haplogroup', mHaplogroups);
		let t2 = createTable('paternal-haplogroup', 'Y-DNA Haplogroup', pHaplogroups);

		let table = document.createElement('table');
		table.setAttribute('id', 'double-table');
		table.appendChild(t1);
		table.appendChild(t2);

		let instructions = document.getElementById('instructions');
		instructions.parentNode.removeChild(instructions);

		let dropZone = document.getElementById('drop-zone');
		dropZone.style.height = null;
		dropZone.appendChild(table);
	};

	reader.readAsText(file);

}

function handleFileSelect(evt) {
	// TODO: make sure there's only 1 file

	doFileStuff(evt.target.files[0]);
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
}

function handleDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	doFileStuff(evt.dataTransfer.files[0]);
}

function setupListeners() {
	document.getElementById('myfile').addEventListener('change', handleFileSelect, false);
	let dropZone = document.getElementById('all-might');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleDrop, false);
}

setupListeners();