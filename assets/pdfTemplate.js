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
            <table>
                <tr><td>
                    <div class="profile-image" style="background-image: url(` + author.imagePath + `);"></div>
                    <div class="user-name">` + author.name + `</div>
                </td></tr>
            </table>
            <table>
                <tr><td class="body">
                    ` + message + `
                </td></tr>
            </table>
            <table>
                <tr><td>
                    <div class="footer">Reality Wall</div>
                    <div class="qr-code">
                        <img src="http://api.qrserver.com/v1/create-qr-code/?` + querystring.stringify({data: Constants.DEPLOY_BASE_URL + `/walls/` + wallId}) + `&size=80x80" alt=""/>
                    </div>
                </td></tr>
            </table>
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
module.exports = function (wallId, posts) {
    if (posts.length == 0) return "<div>No Posts on this wall</div>";
    else {
        return posts.map((post) => {
            return _generateSinglePostTemplate(wallId, post.author, post.message);
        });
    }
};