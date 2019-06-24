// constructs the suggestion engine
var activity = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    
    local: activity
});

$('#bloodhound .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
},
{
    name: 'activity',
    source: activity
});
 