// copy url by create dummy element to copy from
const copyUrlToClipboard = (val, successCb) => {
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.setAttribute('value', val);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    document.execCommand('copy');
    if (successCb) successCb();
};

export default copyUrlToClipboard;
