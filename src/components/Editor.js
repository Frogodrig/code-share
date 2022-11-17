import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../actions';

const Editor = ({socketRef, roomId, onCodeChange}) => {

  const editorRef = useRef(null);

  useEffect(() => {

    async function init() {

      editorRef.current = CodeMirror.fromTextArea(document.getElementById('realtimeEditor'), {
        mode: "text/x-c++src",
        lineNumbers: true,
        theme: 'dracula',
        indentUnit: 4,
        lineWrapping: true,
        autoCloseBrackets: true,
      });

      editorRef.current.on('change', (instance, changes) => {
        const {origin} = changes;
        const code = instance.getValue();
        //For auto-sync on first load
        onCodeChange(code);
        if(origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });

    }

    init();

  }, []);

  useEffect(() => {

    if(socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({code}) => {
        if(code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    }

  }, [socketRef.current]);

  return (

    <textarea id="realtimeEditor"></textarea>
  );
};

export default Editor;