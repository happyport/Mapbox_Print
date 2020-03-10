function print(content, options) {
    var frameWindow = document.createElement('iframe', {
        "height": "0", "width": "0", "border": "0", "wmode": "Opaque"
    })
    frameWindow.style.position = "absolute";
    frameWindow.style.top = "-999px";
    frameWindow.style.left = "-999px";
    document.body.insertBefore(frameWindow, document.body.firstChild);
    var span = document.createElement('span');
    span.appendChild(content);
    return new Promise((resolve, reject) => {
        printFrame(frameWindow, span.innerHTML, options)
            .then(function () {
                // Success
                setTimeout(function () {
                    frameWindow.remove();
                }, 1000);
                resolve();
            }).catch(err => {
            console.log("print error!");
            reject(err);
        })
    });

}

function printFrame(frameWindow, content, options) {
    return new Promise((resolve, reject) => {
        try {
            frameWindow = frameWindow.contentWindow || frameWindow.contentDocument || frameWindow;
            var wdoc = frameWindow.document || frameWindow.contentDocument || frameWindow;
            if (options&&options.doctype) {
                wdoc.write(options.doctype);
            }
            wdoc.write(content);
            wdoc.close();
            var printed = false,
                callPrint = function () {
                    if (printed) {
                        resolve();
                        return;
                    }
                    frameWindow.focus();
                    try {
                        if (!frameWindow.document.execCommand('print', false, null)) {
                            frameWindow.print();
                        }
                        document.body.focus();
                    } catch (e) {
                        frameWindow.print();
                    }
                    frameWindow.close();
                    printed = true;
                    resolve();
                };
            frameWindow.addEventListener('load',callPrint);
            setTimeout(callPrint, options&&options.timeout||750);
        } catch (err) {
            reject(err);
        }
    })
}
