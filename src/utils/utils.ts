export function makeButton(name, callback: () => void) {
    let $ = parent.$;
    let tlc = $("#topleftcorner");
    tlc.find(`#${name}div`).empty();
    $(`#${name}div`).remove()
    let button = $(`<div id="${name}div"></div>`).html(`<button class="gamebutton" id="${name}">${name}</button>`);
    button.appendTo(tlc);
    $(`#${name}div`).click(callback);
}

export function clearGameLog() {
    let $ = parent.$;
    let gamelog = $("#gamelog");
    gamelog.clear();
}