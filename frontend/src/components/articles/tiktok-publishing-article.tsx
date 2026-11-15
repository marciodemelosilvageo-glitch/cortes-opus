import Link from "next/link";

import { ArticleShell } from "@/components/articles/article-shell";
import { SocialProviderIcon } from "@/components/social-provider-icon";
import type { BlogPost } from "@/lib/blog-posts";

export function TikTokPublishingArticle({ post }: { post: BlogPost }) {
  return (
    <ArticleShell
      post={post}
      breadcrumb="Publicação no TikTok"
      toc={[["whats-live", "O que há de novo"], ["first-post", "Seu primeiro post"], ["both-platforms", "TikTok + YouTube"], ["scheduling", "Agendamento"], ["faq", "Perguntas frequentes"]]}
      faqs={[
        { question: "Já conectei o YouTube. Preciso mudar algo?", answer: "Mantenha sua conexão com o YouTube. Adicione o TikTok nas configurações sociais e escolha qualquer uma das contas ou ambas no publicador web." },
        { question: "Preciso do plano Criador para publicar no TikTok?", answer: "O plano Criador é necessário para agendar publicações com antecedência. Publicar um clipe pronto imediatamente está disponível sem o Criador no SupoClip." },
        { question: "E a publicação no Instagram?", answer: "A publicação direta no Instagram ainda não está disponível. Você pode baixar o clipe finalizado e publicá-lo diretamente pelo aplicativo do Instagram." },
      ]}
      cta={{ title: "Conecte o TikTok e publique seu próximo clipe", body: "Já tem um clipe pronto? Conecte sua conta, abra o clipe e escolha Publicar.", label: "Conectar TikTok", href: "/settings/social" }}
    >
      <p>
        A publicação no TikTok já está disponível no SupoClip. Se você baixava clipes prontos apenas
        para publicá-los no TikTok, agora pode fazer essa etapa diretamente pelo SupoClip.
      </p>
      <p>
        A publicação no YouTube já está disponível, e o publicador web agora permite selecionar mais de
        uma conta conectada. Escolha TikTok, YouTube ou ambos para o mesmo clipe.
      </p>

      <section aria-labelledby="whats-live" className="space-y-5">
        <h2 id="whats-live">Do clipe pronto à publicação</h2>
        <div className="not-prose flex flex-wrap items-center gap-4 rounded-xl border bg-muted/30 p-5">
          <span className="inline-flex items-center gap-2 font-semibold"><SocialProviderIcon provider="tiktok" className="size-6" />TikTok</span>
          <span aria-hidden="true" className="text-muted-foreground">+</span>
          <span className="inline-flex items-center gap-2 font-semibold"><SocialProviderIcon provider="youtube" className="size-6" />YouTube</span>
        </div>
        <p>
          Continue usando o SupoClip para encontrar os melhores momentos, editar legendas e revisar seus cortes. Quando o clipe estiver
          pronto, envie-o para uma conta conectada a partir do menu Publicar. Você escolhe a legenda e
          as opções de visibilidade de cada conta antes de enviar.
        </p>
      </section>

      <section aria-labelledby="first-post" className="space-y-5">
        <h2 id="first-post">Publique seu primeiro clipe no TikTok</h2>
        <ol>
          <li>Abra as <Link href="/settings/social">Configurações sociais</Link>, escolha o TikTok e conclua a conexão. Verifique se conectou a conta desejada.</li>
          <li>Abra um clipe finalizado na web e clique em <strong>Publicar</strong>.</li>
          <li>Selecione sua conta do TikTok. Revise a legenda, hashtags e configuração de privacidade. O TikTok usa a legenda no lugar do título do clipe.</li>
          <li>Envie a publicação e acompanhe o status nas configurações sociais.</li>
        </ol>
        <p>
          Antes de postar, reproduza o clipe completo uma vez. Confira o início, o corte final e os
          nomes ou números nas legendas. Publicar ficou mais rápido, mas a revisão final continua essencial.
        </p>
      </section>

      <section aria-labelledby="both-platforms" className="space-y-5">
        <h2 id="both-platforms">Publique no TikTok e no YouTube de uma só vez</h2>
        <p>
          A seleção de contas na web agora permite escolher múltiplos destinos. Conecte ambas as contas, marque TikTok e
          YouTube na janela de publicação e revise a privacidade para cada destino.
          Não é necessário abrir duas janelas separadas para o mesmo clipe.
        </p>
        <p>
          As contas selecionadas compartilham o título, a legenda e as hashtags. Se preferir
          textos diferentes para cada plataforma, publique em uma conta de cada vez.
        </p>
      </section>

      <section aria-labelledby="scheduling" className="space-y-5">
        <h2 id="scheduling">Planeje com antecedência no Criador</h2>
        <p>
          No plano <strong>Criador</strong>, você pode ativar a opção <strong>Agendar para depois</strong> e escolher
          a data e a hora em vez de publicar na hora. Ao selecionar ambas as contas,
          o agendamento será aplicado a ambos os destinos.
        </p>
        <p>
          Acompanhe suas postagens agendadas em <Link href="/settings/social">Configurações sociais</Link>.
        </p>
      </section>
    </ArticleShell>
  );
}
