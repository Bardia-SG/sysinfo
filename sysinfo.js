const si = require('systeminformation');
const {
    exec
} = require('child_process');
const fs = require('fs');








// promises style - new since version 3w
console.log("MADE BY Bardia-Phoenix\n\n\nsysinfo:")
si.cpu().then(async data => {
    await console.log(`cpu: ${data.manufacturer} ${data.brand} (N${data.family})\n`)
    si.mem().then(async data => {
        await console.log(`ram: ${Math.round(parseInt(data.total)/1073741824)}GB\n`)
        si.graphics().then(async data => {
            await console.log(`graphic(s): ${data.controllers.map(graphic => `${graphic.model} `)}\n`)
            si.diskLayout().then(async data => {
                await console.log(`${data.map(hard => `disk: ${hard.type} ${Math.round(hard.size/1073741824)}GB | health: ${hard.smartStatus} | temp: ${hard.temperature === null ? "NP" : hard.temperature > 50 ? `${hard.temperature} BRUNING!` : `${hard.temperature} fine.`}`).join("\n")}\n`)
                si.battery().then(async data => {
                    if (data.hasBattery) {
                        let designed = data.designedCapacity
                        let current = data.maxCapacity
                        if (current && current !== 0) {
                            if (designed === 0) {
                                function generateBatteryReport() {
                                    exec('powercfg /batteryreport', (err, stdout) => {
                                        if (err) {
                                            console.error('Unable to generate battery report:', err);
                                            return;
                                        }
                                        // Wait for a moment to ensure the report file is created
                                        setTimeout(() => {
                                            readBatteryReport();
                                        }, 1000);
                                    });
                                }
                                async function readBatteryReport() {
                                    const reportPath = `./battery-report.html`;
                                    const data = await fs.readFileSync(reportPath, 'utf8');
                                    if (data.length > 1) {
                                        const designCapacityRegex = /(\d{1,3},\d{3}) mWh/g;
                                        let match = await data.match(designCapacityRegex);
                                        if (match) {
                                            let numberRow = []
                                            for (const part of match) {
                                                const joiner = parseInt(part.replace(',', '').replace('mWh', ''))
                                                numberRow.push(joiner)
                                            }
                                            let highest = Math.max.apply(null, numberRow)
                                            designed = highest;
                                            if (designed && designed !== 0) {
                                                designed = Math.round(designed);
                                                current = Math.round(current);
                                                const health = (current * 100) / designed;
                                                console.log(`battery health: ${Math.round(health)}%`)
                                            } else {
                                                console.log(`battery health: not enough data!`)
                                            }
                                        }
                                    }

                                }
                                await generateBatteryReport();
                            } else {
                                if (designed !== 0) {
                                    designed = Math.round(designed);
                                    current = Math.round(current);
                                    const health = (current * 100) / designed;
                                    console.log(`battery health: ${Math.round(health)}%`)
                                } else {
                                    console.log(`battery health: not enough data!`)
                                }
                            }

                        } else {
                            console.log(`battery health: not enough data!`)
                        }
                    } else {
                        console.log(`battery health: this device has no battery!`)
                    }
                    setTimeout(() => {
                        require('readline')
                            .createInterface(process.stdin, process.stdout)
                            .question("\nPress [Enter] to exit...", function () {
                                process.exit();
                            });
                    }, 60000);
                })
            })
        })
    })
})