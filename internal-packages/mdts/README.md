# MDTS

Generates markdown from a vitest/jest test.

It transforms expect.toMatchInlineSnapshot into console.log calls in the markdown file.

The objective is to have type-checked and executable documentation.

It is used for many of the documents of the website.

Check the input in https://github.com/lucasavila00/LmScript/tree/main/examples/docs/tests and the output in https://github.com/lucasavila00/LmScript/tree/main/apps/lmscript-docs/docs

Each test names an output file and it's content becomes the markdown file.

Use the md template to append raw markdown.

```
md`
## Usage
`

expect(1).toMatchInlineSnapshot("1")
```
