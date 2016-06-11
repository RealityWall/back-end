'use strict';

const Constants = require('../../constants.js');
const querystring = require("querystring");

/**
 * Generate HTML for a post
 *
 * @param wallId the id of the wall
 * @param author Object with {name, imagePath}
 * @param message the message of the post
 * @returns {string}
 */
function _generateSinglePostTemplate(wallId, author, message) {
    return `
        <div id="wrapper">
            <div class="logo">
                <img src="http://unmurdanslereel.fr/img/logo_black_and_white.png" alt="">
            </div>
            <table class="text-container">
                <tr>
                    <td class="text">
                        ${message}
                    </td>
                </tr>
            </table>
        
            <div class="author">
                ${author.name}
            </div>
            <div class="footer">
                <div class="social">
                    <div class="item">
                        <img src="http://vectorlogofree.com/wp-content/uploads/2014/09/49665-facebook-logo-icon-vector-icon-vector-eps.png"
                             height="40">
                        <div class="text">/unmurdanslereel</div>
                    </div>
                    <div class="item">
                        <img src="http://vectorlogofree.com/wp-content/uploads/2014/06/50920-twitter-logo-bird-shape-in-a-square-icon-vector-icon-vector-eps.png"
                             height="40">
                        <div class="text">/unmurdanslereel</div>
                    </div>
                </div>
                <div class="qr-code">
                    <img src="http://api.qrserver.com/v1/create-qr-code/?` + querystring.stringify({data: Constants.DEPLOY_BASE_URL + `/walls/` + wallId}) + `&size=120x120" alt=""/>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate HTML for the entire list of posts
 *
 * @param wallId the id of the wall
 * @param posts posts list format : {author: {name, imagePath}, message}
 * @returns {*}
 */
module.exports = function (wallId, posts, wall) {
    if (posts.length == 0) {
        let result = '';
        if (wall) {
            result += `
                <table style="height:100%;width: 100%; text-align:center;">
                    <tr style="height:100%;"><td style="height:100%;vertical-align:middle;font-size:32px;">Mur : ${wall.address}</td></tr>
                </table> 
            `;
        }
        return result + "<div>No Posts on this wall</div>";
    } else {
        let result = '';
        if (wall) {
            result += `
                <table style="height:100%;width: 100%; text-align:center;">
                    <tr style="height:100%;"><td style="height:100%;vertical-align:middle;font-size:32px;">Mur : ${wall.address}</td></tr>
                </table> 
            `;
        }
        return result + posts.map((post) => {
            return _generateSinglePostTemplate(wallId, post.author, post.message);
        }).reduce((previous, current) => {
            return previous + '' + current;
        });
    }
};