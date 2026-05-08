function updateStatusBar() {
    const now     = new Date();
    const weekday = now.toLocaleString('en-US', { weekday: 'short' });
    const date    = String(now.getDate()).padStart(2, '0');
    const month   = now.toLocaleString('en-US', { month: 'short' });
    const hh      = String(now.getHours()).padStart(2, '0');
    const mm      = String(now.getMinutes()).padStart(2, '0');

    const city = $('#city').text();
    const temp = $('#temperature').text();
    const desc = $('#weather').text();

    const weatherPart = (city && city !== 'Not available')
        ? `${city}  ·  ${temp}  ·  ${desc}`
        : '';
    const timePart = `${weekday} ${date} ${month}  ·  ${hh}:${mm}`;

    $('#status-right').text([weatherPart, timePart].filter(Boolean).join('  ·  '));
}

function updateClock() {
    const now     = new Date();
    const hours   = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    $('#hour').text(hours);
    $('#minutes').text(minutes);
    $('#seconds').text(seconds);
    $('#day').text(now.getDate());
    $('#month').text(`"${now.toLocaleString('en-US', { month: 'long' })}"`);
    $('#year').text(now.getFullYear());
    updateStatusBar();
}
