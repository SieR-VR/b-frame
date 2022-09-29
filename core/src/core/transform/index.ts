import ts from "typescript";

export default function transformSource(source: string): string {
    const sourceFile = ts.createSourceFile("index.ts", source, ts.ScriptTarget.Latest);
    const result = ts.transform(sourceFile, [transform]);

    const printer = ts.createPrinter();
    return printer.printFile(result.transformed[0]);
}

function transform(
    context: ts.TransformationContext
): ts.Transformer<ts.SourceFile> {
    try {
        return (sourceFile: ts.SourceFile) => ts.visitEachChild(sourceFile, (node) => visitor(node, context), context);
    } catch (e) {
        console.error(e);
        throw e;
    }
}

function visitor(node: ts.Node, context: ts.TransformationContext): ts.Node {
    if (isExtendsEntity(node) && isExtendsSystem(node))
        throw new Error("Cannot extend both Entity and System");

    if (isExtendsEntity(node))
        return transformEntity(node, context);

    if (isExtendsSystem(node))
        return transformSystem(node, context);

    return ts.visitEachChild(node, (n) => visitor(n, context), context);
}

function isExtendsEntity(node: ts.Node): node is ts.ClassDeclaration {
    return (ts.isClassDeclaration(node) && node.heritageClauses?.some((clause) => {
        return clause.types.some((type) => {
            return ts.isIdentifier(type.expression) && type.expression.text.includes("Entity");
        });
    })) ?? false;
}

function isExtendsSystem(node: ts.Node): node is ts.ClassDeclaration {
    return (ts.isClassDeclaration(node) && node.heritageClauses?.some((clause) => {
        return clause.types.some((type) => {
            return ts.isIdentifier(type.expression) && type.expression.text.includes("System");
        });
    })) ?? false;
}

function transformEntity(node: ts.ClassDeclaration, context: ts.TransformationContext): ts.Node {
    const typeArgument = 
        node.heritageClauses &&
        node.heritageClauses[0] && 
        node.heritageClauses[0].types &&
        node.heritageClauses[0].types[0] &&
        node.heritageClauses[0].types[0].typeArguments &&
        node.heritageClauses[0].types[0].typeArguments[0];

    if (!typeArgument)
        return node;

    if (!ts.isTupleTypeNode(typeArgument))
        throw new Error("Entity must be parameterized with a tuple type");
    
    const components = typeArgument.elements.map((type) => {
        if (!ts.isTypeReferenceNode(type))
            throw new Error("Entity must be parameterized with a tuple of type references");

        if (!ts.isIdentifier(type.typeName))
            throw new Error("Entity must be parameterized with a tuple of identifiers");

        return type.typeName.text;
    });

    const componentProperties = components.map((component) => {
        const hashed = component.split("").reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        const hashString = hashed.toString(16).padStart(8, "0");

        return ts.factory.createStringLiteral(hashString);
    });

    const componentProperty = ts.factory.createPropertyDeclaration(
        undefined,
        [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)],
        ts.factory.createIdentifier("components"),
        undefined,
        undefined,
        ts.factory.createArrayLiteralExpression(componentProperties)
    );

    return ts.factory.updateClassDeclaration(
        node,
        node.decorators,
        node.modifiers,
        node.name,
        node.typeParameters,
        node.heritageClauses,
        [
            ...node.members,
            componentProperty
        ]
    );
}

function transformSystem(node: ts.ClassDeclaration, context: ts.TransformationContext): ts.Node {
    const typeArgument = 
        node.heritageClauses &&
        node.heritageClauses[0] && 
        node.heritageClauses[0].types &&
        node.heritageClauses[0].types[0] &&
        node.heritageClauses[0].types[0].typeArguments &&
        node.heritageClauses[0].types[0].typeArguments[0];

    if (!typeArgument)
        return node;

    if (!ts.isTypeReferenceNode(typeArgument))
        throw new Error("System must be parameterized with a type reference");

    const componentProperty = ts.factory.createPropertyDeclaration(
        undefined,
        [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)],
        ts.factory.createIdentifier("component"),
        undefined,
        undefined,
        ts.factory.createStringLiteral(typeArgument.typeName.getText())
    );

    return ts.factory.updateClassDeclaration(
        node,
        node.decorators,
        node.modifiers,
        node.name,
        node.typeParameters,
        node.heritageClauses,
        [
            ...node.members,
            componentProperty
        ]
    );
}

const SimpleHash = (str: string) => {
    const hashed = str.split("").reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);

    return hashed.toString(16).padStart(8, "0");
}