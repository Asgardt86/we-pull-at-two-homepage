/* =================================================== Klassenverteilung
=================================================== */

function renderClassRow(classData, total) {

    const percent = (classData.count / total) * 100;

    const icon =
        `https://wow.zamimg.com/images/wow/icons/medium/class_${classData.icon}.jpg`;

    return `

        <div class="class-row">

            <div class="class-header">

                <div class="class-info">

                    <img
                        src="${icon}"
                        alt="${classData.name}"
                    >

                    <div
                        class="class-name"
                        style="color:${classData.color};"
                    >

                        ${classData.name}

                    </div>

                </div>

                <div class="class-count">

                    ${classData.count}

                </div>

            </div>

            <div class="class-bar">

                <div
                    class="class-bar-fill"
                    style="width:${percent}%; background:${classData.color};"
                ></div>

            </div>

        </div>

    `;

}

async function loadClasses() {

    const container =
        document.getElementById("classes");

    try {

        const response =
            await fetch("/api/classes");

        const data =
            await response.json();

        let html = `

            <div class="classes-panel">

                <div class="classes-grid">

                    <div class="classes-section">

                        <div class="classes-title">

                            Gesamte Gilde (${data.total80})

                        </div>

        `;

        if (data.classes80?.length) {

            [...data.classes80]
                .sort((a, b) => b.count - a.count)
                .forEach(classData => {

                    html += renderClassRow(classData, data.total80);

                });

        }

        html += `

                    </div>

                    <div class="classes-section">

                        <div class="classes-title">

                            Max Level (${data.totalMax})

                        </div>

        `;

        if (data.classesMax?.length) {

            [...data.classesMax]
                .sort((a, b) => b.count - a.count)
                .forEach(classData => {

                    html += renderClassRow(classData, data.totalMax);

                });

        }

        html += `

                    </div>

                </div>

            </div>

        `;

        container.innerHTML = html;

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="classes-panel">

                <div class="classes-empty">

                    Klassenverteilung konnte nicht geladen werden.

                </div>

            </div>

        `;

    }

}

document.addEventListener("DOMContentLoaded", loadClasses);
