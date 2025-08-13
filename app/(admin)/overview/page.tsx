import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import NoUserComponent from "@/components/NoUserComponent";
import { getUser } from "@/actions/actions";
import React from "react";
import { PERMITED_ROLES } from "@/utils/dataAdd";

const OverviewPage = async () => {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  return (
    <div>
      OverviewPage
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Culpa aperiam
        doloribus in. Debitis consequatur eius reprehenderit, deserunt facere
        hic voluptatum vero minima quasi delectus est provident autem a laborum
        tempora? Doloribus sint natus, sed ipsam neque voluptatibus placeat
        fugiat dolores assumenda culpa numquam consequatur, voluptates similique
        accusamus harum. Adipisci, consectetur? Quia reprehenderit adipisci
        quas. Reiciendis qui molestias esse? Quod, debitis. Quos, impedit
        dolorum incidunt eligendi fugiat possimus, quaerat labore maxime quasi
        quisquam doloribus? Praesentium officia accusantium fugit facere libero
        iure odit amet hic quidem ad, eius eum dolores, harum fuga! Vel
        doloremque, ratione minima tenetur molestiae inventore id perferendis
        soluta illum pariatur nam impedit tempore exercitationem iste quas sequi
        vitae voluptas incidunt fuga sunt, illo harum, eveniet similique!
        Pariatur, aliquid. Sunt nulla, quasi animi debitis necessitatibus
        laboriosam sint illo officia itaque! Aliquam quod reiciendis hic
        consequuntur quae nisi maxime mollitia assumenda reprehenderit, nam
        tempora laborum nostrum unde. Inventore, illum assumenda? Necessitatibus
        optio autem enim repudiandae quam voluptas pariatur eum ullam quisquam
        repellendus molestiae eaque voluptatibus rem rerum eius, delectus omnis
        iusto. Cum laborum laboriosam et eius, necessitatibus rerum enim
        tempora. Assumenda perspiciatis unde alias ab molestiae! Libero
        necessitatibus sequi possimus maxime enim quos, quidem consequatur! Qui
        sint excepturi veritatis quae non reprehenderit, assumenda esse autem?
        Tenetur mollitia consequatur rerum facere! Quisquam sapiente
        repellendus, eligendi ea officia praesentium harum earum! At asperiores
        fugiat non adipisci facilis esse culpa omnis placeat, pariatur ullam
        optio ratione impedit, debitis exercitationem. Autem repellat recusandae
        officiis. Fuga, pariatur ducimus neque quasi hic dolores velit delectus,
        dolorum excepturi molestiae autem. Recusandae sit architecto facere
        fugiat nulla labore maiores excepturi ut, voluptatum voluptatem tempore
        praesentium ea nihil distinctio! Dolorem ut reprehenderit amet sed sequi
        tenetur accusantium vero aut delectus at! Ipsa aliquid minima, ipsum
        praesentium tempore reprehenderit quaerat rerum nemo voluptate, sint
        nostrum mollitia minus ad recusandae neque.
      </p>
    </div>
  );
};

export default OverviewPage;
