function test() {
    game_log("test")
}
let $ = parent.$;    
let tlc = $("#topleftcorner"); 
tlc.find("#invitealldiv").empty();
$('#invitealldiv').remove()
let button = $('<div id="invitealldiv"></div<').html('<button class="gamebutton" id="inviteall">Invite</button>');
button.appendTo(tlc);
$("#invitealldiv").click(function() {
    send_party_invite("WizardJorbo")
    send_party_invite("FatherJorbo")
});