export const search = function(req, res) {
    var q = req.query.q;
    q = encodeURIComponent(q);
    res.redirect("https://www.google.com/search?q=site:xugaoyang.com+" + q);
    console.log("search" + q);
};
