    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 400 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var srcdiv = d3.select("#srctext")
    var tgtdiv = d3.select("#tgttext")

    d3.select('#analysispanel').style('left', parseInt($(window).width() * .68) + 'px').style('position', 'fixed')

    // var lang;
    // d3.selectAll(("input[name='language']")).on("change", function () {
    //     if (this.value == 'spanish') {
    //         lang = 'spanish'
    //     } else {
    //         lang = 'russian'
    //     }
    // })
    var lang = 'russian'
    
    d3.json(lang+"/sentsInOrder.json", function (data) {

        var srccharcount = 0; var tgtcharcount = 0;


        // APPEND SOURCE SENTENCES
        // var spanhtml = ''
        data.srcSentsInOrder.text.forEach(function (sent, i) {
            srcdiv
                .append('span')
                .attr('id', 'srcsent' + i)
                .attr('class', 'sentence chosen')

            var tokens = data.srcSentsInOrder.tokens[i]
            // var tokenshtml = ''
            tokens.forEach(function (t, j) {
                srccharcount += t.text.length
                // tokenshtml = tokenshtml +`<span id="srcsent${i}span${j}" class="token"><mark id="srcsent${i}token${j}">${t.text}</mark></span>`
            })
            // spanhtml = spanhtml + `<span id="srcsent${i}" class="sentence chosen">${tokenshtml}</span>`
            d3.select('#srcsent' + i)
                .selectAll('div')
                .data(tokens)
                .enter()
                .append('span')
                .attr('id', function (d, j) { return 'srcsent' + i + 'span' + j })
                .attr('class', 'token')
                .append('mark')
                .attr('id', function (d, j) { return 'srcsent' + i + 'token' + j })
                .html(function (d, j) {
                    return spacenospace(tokens, d, j)
                })
                .style('background-color', 'white')
        })

        function spacenospace(tokens, d, j) {
            if (j < tokens.length-1) {
                if ('.,)?'.includes(tokens[j+1].text)) {
                    return d.text
                } 
            } 
            if ('(??'.includes(d.text)) {
                return d.text
            }

            return d.text + ' '
        }
                // d3.select('#srctext').html(spanhtml)


        // APPEND TARGET SENTENCES
        data.tgtSentsInOrder.text.forEach(function (sent, i) {
            tgtdiv
                .append('span')
                .attr('id', 'tgtsent' + i)
                .attr('class', 'sentence chosen')

            var tokens = data.tgtSentsInOrder.tokens[i]

            tokens.forEach(function (t) {
                tgtcharcount += t.text.length
            })

            d3.select('#tgtsent' + i)
                .selectAll('span')
                .data(tokens)
                .enter()
                .append('span')
                .attr('id', function (d, j) { return ('tgtsent' + i + 'span' + j) })
                .attr('class', 'token')
                .append('mark')
                .attr('id', function (d, j) { return ('tgtsent' + i + 'token' + j) })
                .html(function (d, j) {
                    return spacenospace(tokens, d, j)
                })
                .style('background-color', 'white')
        })
        var totalcharcount = srccharcount + tgtcharcount

        // MAKE SURE CORRECT WIDTH
        var srccolwidth = parseInt(srccharcount / totalcharcount * ($(window).width() - 100) * .66)
        var tgtcolwidth = parseInt(tgtcharcount / totalcharcount * ($(window).width() - 100) * .66)
        console.log(srccolwidth, tgtcolwidth)
        var analysiswidth = parseInt(($(window).width() - 100) * .33)

        d3.select('.wrapper').style('grid-template-columns', `${srccolwidth}px ${tgtcolwidth}px ${analysiswidth}px`)


        d3.json(lang+'/wordAlignment.json', function (wadata) {

            var src2tgt = Object()
            var tgt2src = Object()
            src2tgt['sentences'] = Object()
            src2tgt['tokens'] = Object()
            tgt2src['sentences'] = Object()
            tgt2src['tokens'] = Object()

            // CREATE WORD AND SENTENCE ALIGNMENT LOOKUP
            wadata.forEach(function (s) {
                // sent level
                var i = s.srcsentidx
                var j = s.tgtsentidx
                src2tgt['sentences'][i] = j
                tgt2src['sentences'][j] = i

                // token level
                src2tgt['tokens'][i] = Object()
                tgt2src['tokens'][j] = Object()
                s.alignedwordindices.forEach(function (kl) {
                    var k = kl[0]; var l = kl[1]
                    src2tgt['tokens'][i][k] = l
                    tgt2src['tokens'][j][l] = k
                })

            })

            // handle radio buttons
            d3.selectAll(("input[name='level']")).on("change", function () {
                if (this.value == 'wordlevel') {
                    d3.selectAll('.sentence').classed('chosen', false)
                    d3.selectAll('.token').classed('chosen', true)
                } else {
                    d3.selectAll('.sentence').classed('chosen', true)
                    d3.selectAll('.token').classed('chosen', false)
                }
            })

            // HOVER SENTENCES
            d3.selectAll('.sentence').on('mouseover', function () {
                var chosenElt = d3.select(this)
                if (chosenElt.classed('chosen')) {
                    var chosenID = chosenElt.attr('id')

                    var index1 = chosenID.replace('sent', '').replace('src', '').replace('tgt', '')

                    if (chosenID.includes('src')) {
                        var which = 'tgt'
                        var index2 = src2tgt['sentences'][index1]
                    } else {
                        var which = 'src'
                        var index2 = tgt2src['sentences'][index1]
                    }

                    chosenElt.selectAll('span.token').transition().style('background-color', 'aqua')
                    d3.select('#' + which + 'sent' + index2).selectAll('span.token').transition().style('background-color', 'aqua')
                }
            })
            d3.selectAll('.sentence').on('mouseout', function () {
                d3.selectAll('.sentence').selectAll('span.token').transition().style('background-color', 'white')
            })

            // HOVER TOKENS
            d3.selectAll('.token').on('mouseover', function () {
                var chosenElt = d3.select(this)
                if (chosenElt.classed('chosen')) {
                    var chosenID = chosenElt.attr('id')
                    console.log('token ohover')
                    var sentidx1 = chosenID.split('span')[0].replace('sent', '').replace('src', '').replace('tgt', '')
                    var tokenidx1 = chosenID.split('span')[1]
                    var exists = true
                    if (chosenID.includes('src')) {
                        var which = 'tgt'
                        try {
                            var sentidx2 = src2tgt['sentences'][sentidx1]
                            var tokenidx2 = src2tgt['tokens'][sentidx1][tokenidx1]
                        } catch { exists = false; }
                    } else {
                        var which = 'src'
                        try {
                            var sentidx2 = tgt2src['sentences'][sentidx1]
                            var tokenidx2 = tgt2src['tokens'][sentidx1][tokenidx1]
                        } catch { exists = false; }
                    }
                    if (exists) {
                        chosenElt.transition().style('background-color', 'aqua')
                        d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).transition().style('background-color', 'aqua')
                    } else {
                        d3.select(this).style('cursor', 'default')
                    }
                }
            })
            d3.selectAll('.token').on('mouseout', function () {
                d3.selectAll('.token').selectAll('mark').transition().style('background-color', 'white')
            })

            // CLICK TOKENS
            d3.selectAll('.token').on('click', function () {
                $("#ngramtitle").empty();
                $("#ngramviewer").empty();

                var chosenElt = d3.select(this)
                if (chosenElt.classed('chosen')) {
                    var chosenID = chosenElt.attr('id')
                    var sentidx1 = chosenID.split('span')[0].replace('sent', '').replace('src', '').replace('tgt', '')
                    var tokenidx1 = chosenID.split('span')[1]
                    var exists = true
                    if (chosenID.includes('src')) {
                        var which = 'tgt'
                        try {
                            var sentidx2 = src2tgt['sentences'][sentidx1]
                            var tokenidx2 = src2tgt['tokens'][sentidx1][tokenidx1]
                            var tgttoken = d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).text()
                            var srctoken = chosenElt.text()
                        } catch { exists = false }
                    } else {
                        var which = 'src'
                        try {
                            var sentidx2 = tgt2src['sentences'][sentidx1]
                            var tokenidx2 = tgt2src['tokens'][sentidx1][tokenidx1]
                            var srctoken = d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).text()
                            var tgttoken = chosenElt.text()
                        } catch { exists = false }
                    }
                    if (exists) {
                        // display word pair up top
                        d3.select('#wordpair').text(srctoken + '- ' + tgttoken)

                        // wiktionary  
                        // $.get('http://en.wiktionary.org/w/index.php?title=testx&printable=yes',function(data, status) {
                        //     console.log(data)
                        // }); 

                        // for ngrams viewer
                        var direct_url = 't1%3B%2C';
                        var content = '';
                        var index = 0;
                        var array = [srctoken.toLowerCase(), tgttoken.toLowerCase()]
                        for (const token of array) {
                            // for ngram viewer
                            if (index != 1) {
                                var corpus = ''
                                if (lang == 'spanish') {
                                    corpus = 'spa_2019'
                                } else if (lang == 'russian') {
                                    corpus = 'rus_2019'
                                }
                                direct_url = direct_url + token + '%3A'+corpus+'%3B%2Cc0%3B.t1%3B%2C';
                                content = content + token + '%2C+'
                            }
                            else {
                                // deal with last element in array (differenr url endings)
                                direct_url = direct_url + token + '%3Aeng_2019%3B%2Cc0';
                                content = content + token;
                            }
                            index += 1;
                        }
                        // ngrams div
                        $("#ngramtitle").append('<tr style="color:gray"><th> Google N-Gram Viewer</th><th>');
                        $("#ngramviewer").append('<iframe name="ngram_chart" src="https://books.google.com/ngrams/interactive_chart?smoothing=3&direct_url=' + direct_url
                            + '&corpus=36&year_start=1800&content=' + content
                            + '&year_end=2010" width=' + $('#analysispanel').width() + ' height=200 marginwidth=0 marginheight=0 hspace=0 vspace=0 frameborder=0 scrolling=no></iframe>');
                        // done ngrams

                    } else {
                        d3.select('#wordpair').text('[Alignment failure]')
                    }
                }


            }) // end token click


        })
    })