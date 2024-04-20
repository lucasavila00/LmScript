use aici::{
    bintokens::build_tok_trie, cfg::CfgParser, recognizer::StackRecognizer, rx::RecRx, toktree,
};
use pyo3::{exceptions::PyValueError, prelude::*};
use tokenizers::tokenizer;
mod aici;
mod utils;
use regex_automata::util::primitives::StateID;

#[pyclass]
struct TokTrie {
    trie: toktree::TokTrie,
}

#[pymethods]
impl TokTrie {
    #[new]
    fn new(tokenizer_path: String) -> PyResult<Self> {
        let tokenizer = map_anyhow!(tokenizer::Tokenizer::from_file(tokenizer_path))?;
        let trie = map_anyhow!(build_tok_trie(tokenizer))?;
        Ok(TokTrie { trie })
    }
}

#[pyclass]
struct RegexRecognizer {
    state: Box<StackRecognizer<StateID, RecRx>>,
}

#[pymethods]
impl RegexRecognizer {
    #[new]
    fn new(rx: String) -> PyResult<Self> {
        let rx = map_anyhow!(RecRx::from_rx(&rx))?;
        let state = StackRecognizer::from(rx).into();
        Ok(RegexRecognizer { state })
    }
    fn token_allowed(&mut self, trie: &TokTrie, token: u32) -> bool {
        trie.trie.token_allowed(self.state.as_mut(), token)
    }
    fn compute_bias(&mut self, trie: &TokTrie) -> Vec<f32> {
        let mut token_set = trie.trie.alloc_token_set();
        trie.trie.compute_bias(self.state.as_mut(), &mut token_set);
        let mut acc = vec![-f32::INFINITY; trie.trie.vocab_size()];
        token_set.apply_to(&mut acc);
        acc
    }
    fn append_token(&mut self, trie: &TokTrie, token: u32) {
        trie.trie.append_token(self.state.as_mut(), token);
    }
}
#[pyclass]
struct YaccRecognizer {
    state: Box<CfgParser>,
}
#[pymethods]
impl YaccRecognizer {
    #[new]
    fn new(cfg: String) -> PyResult<Self> {
        let cfg = map_anyhow!(CfgParser::from_yacc(&cfg))?;
        let state = cfg.into();
        Ok(YaccRecognizer { state })
    }
    fn token_allowed(&mut self, trie: &TokTrie, token: u32) -> bool {
        trie.trie.token_allowed(self.state.as_mut(), token)
    }
    fn compute_bias(&mut self, trie: &TokTrie) -> Vec<f32> {
        let mut token_set = trie.trie.alloc_token_set();
        trie.trie.compute_bias(self.state.as_mut(), &mut token_set);
        let mut acc = vec![-f32::INFINITY; trie.trie.vocab_size()];
        token_set.apply_to(&mut acc);
        acc
    }
    fn append_token(&mut self, trie: &TokTrie, token: u32) {
        trie.trie.append_token(self.state.as_mut(), token);
    }
}

/// A Python module implemented in Rust.
#[pymodule]
fn logits(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<TokTrie>()?;
    m.add_class::<RegexRecognizer>()?;
    m.add_class::<YaccRecognizer>()?;
    Ok(())
}
