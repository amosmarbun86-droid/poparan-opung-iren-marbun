/* =========================
   CALCULATE AGE
   Hitung umur dari tanggal lahir.
   Jika deathDate diisi, umur dihitung sampai tanggal itu
   (umur saat meninggal). Jika tidak, umur sampai hari ini.
========================= */

export function calculateAge(birthDate, deathDate) {

  if (!birthDate) return null;

  const start = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();

  if (isNaN(start.getTime())) return null;

  let age = end.getFullYear() - start.getFullYear();

  const monthDiff = end.getMonth() - start.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

/* =========================
   POPULATE SELECT
   Isi ulang <select> dengan daftar orang.
   - selectedId  : value yang harus terpilih
   - excludeId   : id yang tidak boleh muncul (mis. diri sendiri saat edit)
========================= */

export function populateSelect(selectEl, people, placeholder, selectedId = "", excludeId = null) {

  selectEl.innerHTML = `<option value="">${placeholder}</option>`;

  people.forEach(person => {

    if (excludeId && person.id === excludeId) return;

    const isSelected = person.id === selectedId ? "selected" : "";

    selectEl.innerHTML += `
      <option value="${person.id}" ${isSelected}>
        ${person.name}
      </option>
    `;
  });
}
